"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const environment_1 = require("./config/environment");
const health_routes_1 = __importDefault(require("./routes/health.routes"));
const fishbowl_routes_1 = __importDefault(require("./routes/fishbowl.routes"));
const aiagent_routes_1 = __importDefault(require("./routes/aiagent.routes"));
const msgraph_routes_1 = __importDefault(require("./routes/msgraph.routes"));
const msgraph_service_1 = require("./services/msgraph.service");
const vectorstore_service_1 = require("./services/vectorstore.service");
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use("/api", health_routes_1.default);
app.use("/api/fishbowl", fishbowl_routes_1.default);
app.use("/api/agent", aiagent_routes_1.default);
app.use("/api/msgraph", msgraph_routes_1.default);
// Initialize webhook subscriptions
async function initializeWebhooks() {
    try {
        console.log("Clearing webhook subscriptions...");
        await msgraph_service_1.msGraphService.clearSubscriptions();
        console.log("Creating webhook subscriptions...");
        await msgraph_service_1.msGraphService.createSubscription();
        console.log("Webhook subscriptions initialized");
        // Renew subscriptions every 24 hours
        setInterval(async () => {
            try {
                console.log("Renewing webhook subscriptions...");
                await msgraph_service_1.msGraphService.renewSubscriptions();
                console.log("Subscriptions renewed");
            }
            catch (error) {
                console.error("Failed to renew subscriptions:", error.message);
            }
        }, 24 * 60 * 60 * 1000); // 24 hours
    }
    catch (error) {
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
    setInterval(async () => {
        const now = new Date();
        const day = now.getDay(); // 0 = Sunday, 6 = Saturday
        const hour = now.getHours();
        // Run if it's Saturday (6) at midnight (0)
        if (day === 6 && hour === 0) {
            try {
                await vectorstore_service_1.vectorStoreService.updateVectorStore();
                console.log("Vector store updated on Saturday at midnight");
            }
            catch (error) {
                console.error("Scheduled vector store update failed:", error.message);
            }
        }
    }, 60 * 60 * 1000 // Check every hour
    );
}
app.listen(environment_1.config.port, async () => {
    console.log(`Server running on port ${environment_1.config.port}`);
    await initializeWebhooks();
    try {
        await vectorstore_service_1.vectorStoreService.updateVectorStore();
    }
    catch (error) {
        console.error("Scheduled vector store update failed:", error.message);
    }
    manageVectorStore();
});
//# sourceMappingURL=server.js.map