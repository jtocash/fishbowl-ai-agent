import express from "express";
import cors from "cors";
import { config } from "./config/environment";
import healthRoutes from "./routes/health.routes";
import fishbowlRoutes from "./routes/fishbowl.routes";
import aiAgentRoutes from "./routes/aiagent.routes";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", healthRoutes);
app.use("/api/fishbowl", fishbowlRoutes);
app.use("/api/agent", aiAgentRoutes);

app.listen(config.port, () =>
  console.log(`✅ Server running on port ${config.port}`)
);
