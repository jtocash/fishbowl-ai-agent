import { ClientCertificateCredential } from "@azure/identity";
import { Client } from "@microsoft/microsoft-graph-client";
import { config } from "../config/environment";
import path from "path";

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

export async function graphTest() {
  try {
    console.log("🔑 Getting Graph data...");

    const messages = await graphClient
      .api(`/users/${userEmail}/messages`)
      .get();
    console.log(messages);

    // const mail = {
    //   message: {
    //     subject: "Hello from AiAgent (Graph SDK)",
    //     body: {
    //       contentType: "Text",
    //       content:
    //         "This email was sent using Microsoft Graph SDK + certificate auth!",
    //     },
    //     toRecipients: [{ emailAddress: { address: "someone@example.com" } }],
    //   },
    // };

    //     await graphClient.api(`/users/${userEmail}/sendMail`).post(mail);
    //     console.log("📤 Email sent successfully!");
    return messages;
  } catch (err: any) {
    console.error("❌ Error:", err.message);
    if (err.response?.data) {
      console.error("Details:", err.response.data);
    }
    throw err;
  }
}
