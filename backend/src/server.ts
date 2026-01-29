import express from "express";
import cors from "cors";
import { config } from "./config/environment";
import healthRoutes from "./routes/health.routes";
import fishbowlRoutes from "./routes/fishbowl.routes";
import aiAgentRoutes from "./routes/aiagent.routes";
import msGraphRoutes from "./routes/msgraph.routes";
import { msGraphService } from "./services/msgraph.service";
import { vectorStoreService } from "./services/vectorstore.service";
import utilityRoutes from './routes/utilities.routes'
import { fishbowlService } from "./services/fishbowl.service";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", healthRoutes);
app.use("/api/fishbowl", fishbowlRoutes);
app.use("/api/utilities", utilityRoutes)
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
}

// function manageFishbowlLogin() {
//   // Relogin every 30 minutes
//   setInterval(
//     async () => {
//         console.log("Scheduled relogin, Relogging into fishbowl");
//         try {
//           await fishbowlService.logOut();
//         } catch (error: any) {
//           console.error("Failed to log out:", error.message);
//         }
//         try {
//           await fishbowlService.login();
//         } catch (error: any) {
//           console.error("Failed to login:", error.message);
//         }
//     },
//     30 * 60 * 1000
//   );
// }

function manageVectorStore() {
  setInterval(
    async () => {
      const now = new Date();
      const day = now.getDay(); // 0 = Sunday, 6 = Saturday
      const hour = now.getHours();

      // Run if it's Saturday (6) at midnight (0)
      if (day === 6 && hour === 0) {
        try {
          await vectorStoreService.updateVectorStore();
          console.log("Vector store updated on Saturday at midnight");
        } catch (error: any) {
          console.error("Scheduled vector store update failed:", error.message);
        }
      }
    },
    60 * 60 * 1000 // Check every hour
  );
}

app.listen(config.port, async () => {
  console.log(`Server running on port ${config.port}`);

  await initializeWebhooks();
  manageVectorStore();

  // manageFishbowlLogin();
});
