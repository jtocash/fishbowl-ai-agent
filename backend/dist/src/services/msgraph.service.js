"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.graphClient = void 0;
exports.getMail = getMail;
exports.replyToEmail = replyToEmail;
exports.createSubscription = createSubscription;
exports.renewSubscriptions = renewSubscriptions;
exports.getEmailConversation = getEmailConversation;
const identity_1 = require("@azure/identity");
const microsoft_graph_client_1 = require("@microsoft/microsoft-graph-client");
const environment_1 = require("../config/environment");
const html_to_text_1 = require("html-to-text");
const client_secrets_manager_1 = require("@aws-sdk/client-secrets-manager");
const tenantId = environment_1.config.graph.tenantId;
const clientId = environment_1.config.graph.clientId;
const certificatePassword = environment_1.config.graph.certificatePassword;
const userEmail = environment_1.config.graph.userEmail;
let certificatePem = "";
// Load certificate based on environment
async function initializeCertificate() {
    if (process.env.NODE_ENV === "production") {
        const secret = await loadPemSecret();
        if (!secret)
            throw new Error("Failed to load PEM from AWS Secrets Manager");
        certificatePem = Buffer.from(secret, "base64").toString("utf-8");
    }
    else {
        certificatePem = Buffer.from(environment_1.config.graph.pemB64, "base64").toString("utf-8");
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
        // For a list of exceptions thrown, see
        // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
        throw error;
    }
    const secret = response.SecretString;
    return secret;
}
initializeCertificate();
const credential = new identity_1.ClientCertificateCredential(tenantId, clientId, {
    certificate: certificatePem,
    certificatePassword,
});
// Create the Microsoft Graph client
exports.graphClient = microsoft_graph_client_1.Client.initWithMiddleware({
    authProvider: {
        getAccessToken: async () => {
            const tokenResponse = await credential.getToken("https://graph.microsoft.com/.default");
            return tokenResponse.token;
        },
    },
});
async function getMail() {
    try {
        console.log("🔑 Getting Graph data...");
        const messages = await exports.graphClient
            .api(`/users/${userEmail}/messages`)
            .get();
        return messages;
    }
    catch (err) {
        console.error("Error:", err.message);
        throw err;
    }
}
// export async function processEmail(messageId: string): Promise<Email> {
//   try {
//     const response = await graphClient
//       .api(`/users/${userEmail}/messages/${messageId}`)
//       .get();
//     const body = response.body;
//     const message = body.content;
//     const emailFromUser = response.sender;
//     return {
//       body: message,
//       from: emailFromUser.emailAddress.address,
//     };
//   } catch (error: any) {
//     console.error("Error processing email:", error.message);
//     throw error;
//   }
// }
async function replyToEmail(messageId, replyText) {
    try {
        const reply = {
            message: {
                body: {
                    contentType: "Text",
                    content: replyText,
                },
            },
        };
        await exports.graphClient
            .api(`/users/${userEmail}/messages/${messageId}/reply`)
            .post(reply);
        console.log("Replied to email:", messageId);
    }
    catch (err) {
        console.error("Error replying to email:", err.message);
        throw err;
    }
}
async function createSubscription() {
    const baseUrl = environment_1.config.webhooks.baseUrl;
    if (!baseUrl) {
        console.error("Webhook base URL is not set. Please set NGROK_TUNNEL in development or PRODUCTION_URL in production.");
        throw new Error("Webhook base URL not configured");
    }
    try {
        // Check for existing subscriptions
        const existing = await exports.graphClient.api("/subscriptions").get();
        const matching = existing.value.find((sub) => sub.resource === `/users/${userEmail}/messages`);
        if (matching) {
            console.log("Subscription already exists:", matching.id);
            return matching;
        }
        console.log(`${baseUrl}/api/msgraph/webhook`);
        const subscription = await exports.graphClient.api("/subscriptions").post({
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
async function renewSubscriptions() {
    const subs = await exports.graphClient.api("/subscriptions").get();
    for (const sub of subs.value) {
        const expires = new Date(sub.expirationDateTime);
        const now = new Date();
        const expiresTime = expires.getTime();
        const nowTime = now.getTime();
        if ((expiresTime - nowTime) / 3600000 < 24) {
            const newExpiry = new Date(now.getTime() + 3 * 22 * 60 * 60 * 1000); // a little under 3 days (max limit for ms graph webhooks)
            await exports.graphClient.api(`/subscriptions/${sub.id}`).patch({
                expirationDateTime: newExpiry.toISOString(),
            });
            console.log(`Renewed ${sub.id} until ${newExpiry}`);
        }
    }
}
async function getEmailConversation(messageId) {
    try {
        const message = await exports.graphClient
            .api(`/users/${userEmail}/messages/${messageId}`)
            .select("conversationId")
            .get();
        const conversationId = message.conversationId;
        const conversationMessages = await exports.graphClient
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
//# sourceMappingURL=msgraph.service.js.map