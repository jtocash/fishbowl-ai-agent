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
        console.log("Creating webhook subscriptions...");
        await (0, msgraph_service_1.createSubscription)();
        console.log("Webhook subscriptions initialized");
        // Renew subscriptions every 24 hours
        setInterval(async () => {
            try {
                console.log("Renewing webhook subscriptions...");
                await (0, msgraph_service_1.renewSubscriptions)();
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
app.listen(environment_1.config.port, async () => {
    console.log(`✅ Server running on port ${environment_1.config.port}`);
    // Initialize webhooks after server starts
    await initializeWebhooks();
});
//# sourceMappingURL=server.js.map