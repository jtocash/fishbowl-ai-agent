import express from "express";
import cors from "cors";
import { config } from "./config/environment";
import healthRoutes from "./routes/health.routes";
import fishbowlRoutes from "./routes/fishbowl.routes";
import aiAgentRoutes from "./routes/aiagent.routes";
import msGraphRoutes from "./routes/msgraph.routes";
import { msGraphService } from "./services/msgraph.service";
import { fishbowlService } from "./services/fishbowl.service";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", healthRoutes);
app.use("/api/fishbowl", fishbowlRoutes);
app.use("/api/agent", aiAgentRoutes);
app.use("/api/msgraph", msGraphRoutes);

// Initialize webhook subscriptions
async function initializeWebhooks() {
  try {
    console.log("Clearing webhook subscriptions...");
    await msGraphService.clearSubscriptions();
    console.log("Creating webhook subscriptions...");
    await msGraphService.createSubscription();
    console.log("Webhook subscriptions initialized");

    // Renew subscriptions every 24 hours
    setInterval(
      async () => {
        try {
          console.log("Renewing webhook subscriptions...");
          await msGraphService.renewSubscriptions();
          console.log("Subscriptions renewed");
        } catch (error: any) {
          console.error("Failed to renew subscriptions:", error.message);
        }
      },
      24 * 60 * 60 * 1000
    ); // 24 hours
  } catch (error: any) {
    console.error("Failed to initialize webhooks:", error.message);
  }

  // Relogin every 30 minutes
  setInterval(
    async () => {
      try {
        await fishbowlService.login();
      } catch (error: any) {
        console.error("Scheduled relogin failed:", error.message);
      }
    },
    30 * 60 * 1000
  );
}

app.listen(config.port, async () => {
  console.log(`✅ Server running on port ${config.port}`);

  // Initialize webhooks after server starts
  await initializeWebhooks();
});
