"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.msGraphService = void 0;
const identity_1 = require("@azure/identity");
const microsoft_graph_client_1 = require("@microsoft/microsoft-graph-client");
const environment_1 = require("../config/environment");
const html_to_text_1 = require("html-to-text");
const client_secrets_manager_1 = require("@aws-sdk/client-secrets-manager");
const tenantId = environment_1.config.graph.tenantId;
const clientId = environment_1.config.graph.clientId;
const certificatePassword = environment_1.config.graph.certificatePassword;
const userEmail = environment_1.config.graph.userEmail;
// Load certificate based on environment
async function getCertificate() {
    if (process.env.NODE_ENV === "production") {
        const secret = await loadPemSecret();
        if (!secret)
            throw new Error("Failed to load PEM from AWS Secrets Manager");
        return Buffer.from(secret, "base64").toString("utf-8");
    }
    else {
        return Buffer.from(environment_1.config.graph.pemB64, "base64").toString("utf-8");
    }
}
async function loadPemSecret() {
    const secret_name = "PEM_B64";
    const client = new client_secrets_manager_1.SecretsManagerClient({
        region: "us-east-1",
    });
    let response;
    try {
        response = await client.send(new client_secrets_manager_1.GetSecretValueCommand({
            SecretId: secret_name,
            VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
        }));
    }
    catch (error) {
        console.log(error);
        throw error;
    }
    const secret = response.SecretString;
    if (!secret)
        throw new Error("Secret string is empty");
    const parsed = JSON.parse(secret);
    const pem_b64 = parsed.PEM_B64;
    return pem_b64;
}
class MsGraphService {
    constructor() {
        this.graphClient = null;
        this.credential = null;
        this.initialized = false;
    }
    async initialize() {
        if (this.initialized)
            return;
        const certstring = await getCertificate();
        this.credential = new identity_1.ClientCertificateCredential(tenantId, clientId, {
            certificate: certstring,
            certificatePassword,
        });
        this.graphClient = microsoft_graph_client_1.Client.initWithMiddleware({
            authProvider: {
                getAccessToken: async () => {
                    const tokenResponse = await this.credential.getToken("https://graph.microsoft.com/.default");
                    return tokenResponse.token;
                },
            },
        });
        this.initialized = true;
    }
    async getClient() {
        await this.initialize();
        return this.graphClient;
    }
    async getMail() {
        try {
            console.log("Getting Graph data...");
            const messages = await (await this.getClient())
                .api(`/users/${userEmail}/messages`)
                .get();
            return messages;
        }
        catch (err) {
            console.error("Error:", err.message);
            throw err;
        }
    }
    async replyToEmail(messageId, replyText) {
        try {
            const reply = {
                message: {
                    body: {
                        contentType: "Text",
                        content: replyText,
                    },
                },
            };
            await (await this.getClient())
                .api(`/users/${userEmail}/messages/${messageId}/reply`)
                .post(reply);
            console.log("Replied to email:", messageId);
        }
        catch (err) {
            console.error("Error replying to email:", err.message);
            throw err;
        }
    }
    async createSubscription() {
        const baseUrl = environment_1.config.webhooks.baseUrl;
        if (!baseUrl) {
            console.error("Webhook base URL is not set. Please set NGROK_TUNNEL in development or PRODUCTION_URL in production.");
            throw new Error("Webhook base URL not configured");
        }
        try {
            const graphClient = await this.getClient();
            // Check for existing subscriptions
            const existing = await graphClient.api("/subscriptions").get();
            const matching = existing.value.find((sub) => sub.resource === `/users/${userEmail}/messages`);
            if (matching) {
                console.log("Subscription already exists:", matching.id);
                return matching;
            }
            console.log(`${baseUrl}/api/msgraph/webhook`);
            const subscription = await graphClient.api("/subscriptions").post({
                changeType: "created",
                notificationUrl: `${baseUrl}/api/msgraph/webhook`,
                resource: `/users/${userEmail}/messages`,
                expirationDateTime: new Date(Date.now() + 3 * 22 * 60 * 60 * 1000).toISOString(),
                clientState: environment_1.config.webhooks.clientState,
            });
            console.log("Webhook subscription created:", subscription.id);
            return subscription;
        }
        catch (error) {
            console.error("Failed to create subscription:", error.message);
            throw error;
        }
    }
    async renewSubscriptions() {
        const graphClient = await this.getClient();
        const subs = await graphClient.api("/subscriptions").get();
        for (const sub of subs.value) {
            const expires = new Date(sub.expirationDateTime);
            const now = new Date();
            const expiresTime = expires.getTime();
            const nowTime = now.getTime();
            if ((expiresTime - nowTime) / 3600000 < 24) {
                const newExpiry = new Date(now.getTime() + 3 * 22 * 60 * 60 * 1000); // a little under 3 days (max limit for ms graph webhooks)
                await graphClient.api(`/subscriptions/${sub.id}`).patch({
                    expirationDateTime: newExpiry.toISOString(),
                });
                console.log(`Renewed ${sub.id} until ${newExpiry}`);
            }
        }
    }
    async clearSubscriptions() {
        try {
            const graphClient = await this.getClient();
            const subs = await graphClient.api("/subscriptions").get();
            const deletePromises = subs.value.map((sub) => graphClient.api(`/subscriptions/${sub.id}`).delete());
            await Promise.all(deletePromises);
            console.log(`Cleared ${subs.value.length} subscription(s)`);
            return { deletedCount: subs.value.length };
        }
        catch (error) {
            console.error("Failed to clear subscriptions:", error.message);
            throw error;
        }
    }
    async refreshSubscription() {
        try {
            const clearResult = await this.clearSubscriptions();
            const newSubscription = await this.createSubscription();
            console.log("Subscription refreshed successfully");
            return {
                ...clearResult,
                newSubscription,
            };
        }
        catch (error) {
            console.error("Failed to refresh subscription:", error.message);
            throw error;
        }
    }
    async getEmailConversation(messageId) {
        try {
            const graphClient = await this.getClient();
            const message = await graphClient
                .api(`/users/${userEmail}/messages/${messageId}`)
                .select("conversationId")
                .get();
            const conversationId = message.conversationId;
            const conversationMessages = await graphClient
                .api(`/users/${userEmail}/messages`)
                .filter(`conversationId eq '${conversationId}'`)
                .select("id,body,from,receivedDateTime,subject")
                .get();
            const emails = conversationMessages.value
                .sort((a, b) => new Date(a.receivedDateTime).getTime() -
                new Date(b.receivedDateTime).getTime())
                .map((msg) => ({
                id: msg.id,
                body: (0, html_to_text_1.convert)(msg.body.content, { wordwrap: false }),
                from: msg.from.emailAddress.address,
                subject: msg.subject,
            }));
            return emails;
        }
        catch (error) {
            console.error("Error fetching email conversation:", error.message);
            throw error;
        }
    }
}
exports.msGraphService = new MsGraphService();
//# sourceMappingURL=msgraph.service.js.map