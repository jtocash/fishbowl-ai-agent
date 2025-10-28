import { webSearchTool } from "@openai/agents";
import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = [
  "FISHBOWL_USERNAME",
  "FISHBOWL_PASSWORD",
  "FISHBOWL_BASE_URL",
  "FISHBOWL_APP_NAME",
  "FISHBOWL_APP_DESCRIPTION",
  "FISHBOWL_APP_ID",
  "OPENAI_API_KEY",
  "GRAPH_CERTIFICATE_PASSWORD",
  "GRAPH_USER_EMAIL",
  "GRAPH_TENANT_ID",
  "GRAPH_CLIENT_ID",
  "PRODUCTION_URL",
  "WEBHOOK_CLIENT_STATE_SECRETPHRASE"
] as const;

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingVars.join(", ")}`
  );
}

export const config = {
  port: process.env.PORT || 5001,
  fishbowl: {
    baseUrl: process.env.FISHBOWL_BASE_URL!,
    username: process.env.FISHBOWL_USERNAME!,
    password: process.env.FISHBOWL_PASSWORD!,
    appName: process.env.FISHBOWL_APP_NAME!,
    appDescription: process.env.FISHBOWL_APP_DESCRIPTION!,
    appId: process.env.FISHBOWL_APP_ID!,
  },
  OpenAI: {
    apiKey: process.env.OPENAI_API_KEY!,
  },
  graph: {
    certificatePassword: process.env.GRAPH_CERTIFICATE_PASSWORD!,
    userEmail: process.env.GRAPH_USER_EMAIL!,
    tenantId: process.env.GRAPH_TENANT_ID!,
    clientId: process.env.GRAPH_CLIENT_ID!,
  },
  webhooks: 
  {
    baseUrl: process.env.NODE_ENV !== 'production' 
    ? process.env.NGROK_TUNNEL! 
    : process.env.PRODUCTION_URL!, // your actual server URL
    clientState: process.env.WEBHOOK_CLIENT_STATE_SECRETPHRASE!
  }
 
};
