import { ClientCertificateCredential } from "@azure/identity";
import { Client } from "@microsoft/microsoft-graph-client";
import { config } from "../config/environment";
import path from "path";
import { Email } from "../types/msgraph.types";
import { convert } from "html-to-text";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import { ConnectContactLens } from "aws-sdk";

const tenantId = config.graph.tenantId;
const clientId = config.graph.clientId;
const certificatePassword = config.graph.certificatePassword;
const userEmail = config.graph.userEmail;

// Load certificate based on environment
async function getCertificate() {
  if (process.env.NODE_ENV === "production") {
    const secret = await loadPemSecret();
    if (!secret) throw new Error("Failed to load PEM from AWS Secrets Manager");
    return Buffer.from(secret, "base64").toString("utf-8");
  } else {
    return Buffer.from(config.graph.pemB64, "base64").toString("utf-8");
  }
}

async function loadPemSecret() {
  const secret_name = "PEM_B64";

  const client = new SecretsManagerClient({
    region: "us-east-1",
  });

  let response;

  try {
    response = await client.send(
      new GetSecretValueCommand({
        SecretId: secret_name,
        VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
      })
    );
  } catch (error) {
    console.log(error);

    throw error;
  }

  const secret = response.SecretString;
  if (!secret) throw new Error("Secret string is empty");
  const parsed = JSON.parse(secret);
  const pem_b64 = parsed.PEM_B64;
  return pem_b64;
}

class MsGraphService {
  private graphClient: Client | null = null;
  private credential: ClientCertificateCredential | null = null;
  private initialized = false;

  private async initialize() {
    if (this.initialized) return;

    const certstring = await getCertificate();

    this.credential = new ClientCertificateCredential(tenantId, clientId, {
      certificate: certstring,
      certificatePassword,
    });

    this.graphClient = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: async () => {
          const tokenResponse = await this.credential!.getToken(
            "https://graph.microsoft.com/.default"
          );
          return tokenResponse.token;
        },
      },
    });

    this.initialized = true;
  }

  async getClient(): Promise<Client> {
    await this.initialize();
    return this.graphClient!;
  }

  async getMail() {
    try {
      console.log("Getting Graph data...");

      const messages = await (await this.getClient())
        .api(`/users/${userEmail}/messages`)
        .get();

      return messages;
    } catch (err: any) {
      console.error("Error:", err.message);
      throw err;
    }
  }

  async replyToEmail(messageId: string, replyText: string) {
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
    } catch (err: any) {
      console.error("Error replying to email:", err.message);
      throw err;
    }
  }

  async sendEmail(recipientEmail: string, subject: string, body: string) {
    try {
      const message = {
        message: {
          subject: subject,
          body: {
            contentType: "Text",
            content: body
          },
          toRecipients: [
            {
              emailAddress: {
                address: recipientEmail
              }
            }
          ]
        }
      };

      await (await this.getClient())
        .api(`/users/${userEmail}/sendMail`)
        .post(message);

      console.log("Email sent to:", recipientEmail);
    } catch (err: any) {
      console.error("Error sending email:", err.message);
      throw err;
    }
  }

  async createSubscription() {
    const baseUrl = config.webhooks.baseUrl;

    if (!baseUrl) {
      console.error(
        "Webhook base URL is not set. Please set NGROK_TUNNEL in development or PRODUCTION_URL in production."
      );
      throw new Error("Webhook base URL not configured");
    }

    try {
      const graphClient = await this.getClient();
      // Check for existing subscriptions
      const existing = await graphClient.api("/subscriptions").get();
      const matching = existing.value.find(
        (sub: any) => sub.resource === `/users/${userEmail}/messages`
      );

      if (matching) {
        console.log("Subscription already exists:", matching.id);
        return matching;
      }

      console.log(`${baseUrl}/api/msgraph/webhook`);
      const subscription = await graphClient.api("/subscriptions").post({
        changeType: "created",
        notificationUrl: `${baseUrl}/api/msgraph/webhook`,
        resource: `/users/${userEmail}/messages`,
        expirationDateTime: new Date(
          Date.now() + 3 * 22 * 60 * 60 * 1000
        ).toISOString(),
        clientState: config.webhooks.clientState,
      });

      console.log("Webhook subscription created:", subscription.id);
      return subscription;
    } catch (error: any) {
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

      const deletePromises = subs.value.map((sub: any) =>
        graphClient.api(`/subscriptions/${sub.id}`).delete()
      );

      await Promise.all(deletePromises);

      console.log(`Cleared ${subs.value.length} subscription(s)`);
      return { deletedCount: subs.value.length };
    } catch (error: any) {
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
    } catch (error: any) {
      console.error("Failed to refresh subscription:", error.message);
      throw error;
    }
  }

  async getEmailConversation(messageId: string): Promise<Email[]> {
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
        .sort(
          (a: any, b: any) =>
            new Date(a.receivedDateTime).getTime() -
            new Date(b.receivedDateTime).getTime()
        )
        .map((msg: any) => ({
          id: msg.id,
          body: convert(msg.body.content, { wordwrap: false }),
          from: msg.from.emailAddress.address,
          subject: msg.subject,
        }));

      return emails;
    } catch (error: any) {
      console.error("Error fetching email conversation:", error.message);
      throw error;
    }
  }
}

export const msGraphService = new MsGraphService();
