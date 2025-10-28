import { ClientCertificateCredential } from "@azure/identity";
import { Client } from "@microsoft/microsoft-graph-client";
import { config } from "../config/environment";
import path from "path";
import { Email } from "../types/msgraph.types";
import { AxiosError } from "axios";

const tenantId = config.graph.tenantId; // e.g. "12345678-abcd-efgh-1234-56789abcdef0"
const clientId = config.graph.clientId; // from Azure App Registration
// Must be a PEM file with both certificate and private key,
// this can be generated from a pfx file.
const certificatePath = path.join(process.cwd(), "graphcertificate.pem");

const certificatePassword = config.graph.certificatePassword; // the export password
const userEmail = config.graph.userEmail; // mailbox or user to act as

const credential = new ClientCertificateCredential(tenantId, clientId, {
  certificatePath,
  certificatePassword,
});

// Create the Microsoft Graph client
const graphClient = Client.initWithMiddleware({
  authProvider: {
    getAccessToken: async () => {
      const tokenResponse = await credential.getToken(
        "https://graph.microsoft.com/.default"
      );
      return tokenResponse.token;
    },
  },
});

export async function getMail() {
  try {
    console.log("🔑 Getting Graph data...");

    const messages = await graphClient
      .api(`/users/${userEmail}/messages`)
      .get();

    return messages;
  } catch (err: any) {
    console.error("Error:", err.message);
    throw err;
  }
}

export async function processEmail(messageId: string): Promise<Email> {
  try {
    const response = await graphClient
      .api(`/users/${userEmail}/messages/${messageId}`)
      .get();
    console.log("Email fetched:", response);
    const body = response.body;
    const message = body.content;
    const emailFromUser = response.sender;

    return {
      body: message,
      from: emailFromUser.emailAddress.address,
    };
  } catch (error: any) {
    console.error("Error processing email:", error.message);
    throw error;
  }
}

export async function replyToEmail(messageId: string, replyText: string) {
  try {
    const reply = {
      message: {
        body: {
          contentType: "Text",
          content: replyText,
        },
      },
    };

    await graphClient
      .api(`/users/${userEmail}/messages/${messageId}/reply`)
      .post(reply);

    console.log("Replied to email:", messageId);
  } catch (err: any) {
    console.error("Error replying to email:", err.message);
    throw err;
  }
}

export async function createSubscription() {
  const baseUrl = config.webhooks.baseUrl;

  if (!baseUrl) {
    console.error(
      "Webhook base URL is not set. Please set NGROK_TUNNEL in development or PRODUCTION_URL in production."
    );
    throw new Error("Webhook base URL not configured");
  }

  try {
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
        Date.now() + 3 * 22 * 60 * 1000
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

export async function renewSubscriptions() {
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
