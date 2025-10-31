"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Build list of required env vars based on environment
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
    "WEBHOOK_CLIENT_STATE_SECRETPHRASE",
    ...(process.env.NODE_ENV !== "production" ? ["PEM_B64"] : []),
];
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);
if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(", ")}`);
}
exports.config = {
    port: process.env.PORT || 5001,
    fishbowl: {
        baseUrl: process.env.FISHBOWL_BASE_URL,
        username: process.env.FISHBOWL_USERNAME,
        password: process.env.FISHBOWL_PASSWORD,
        appName: process.env.FISHBOWL_APP_NAME,
        appDescription: process.env.FISHBOWL_APP_DESCRIPTION,
        appId: process.env.FISHBOWL_APP_ID,
    },
    OpenAI: {
        apiKey: process.env.OPENAI_API_KEY,
    },
    graph: {
        certificatePassword: process.env.GRAPH_CERTIFICATE_PASSWORD,
        userEmail: process.env.GRAPH_USER_EMAIL,
        tenantId: process.env.GRAPH_TENANT_ID,
        clientId: process.env.GRAPH_CLIENT_ID,
        pemB64: process.env.PEM_B64, // In production, call loadPemSecret() before using
    },
    webhooks: {
        baseUrl: process.env.NODE_ENV !== "production"
            ? process.env.NGROK_TUNNEL
            : process.env.PRODUCTION_URL, // your actual server URL
        clientState: process.env.WEBHOOK_CLIENT_STATE_SECRETPHRASE,
    },
};
//# sourceMappingURL=environment.js.map