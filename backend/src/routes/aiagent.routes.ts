import { Router } from "express";
import { runAgent } from "../services/aiagent.service";

const router = Router();

router.post("/input", async (req, res) => {
  const input = req.body.input as string;
  try {
    const workflowres = await runAgent({ input_as_text: input });
    res.json({ agentResponse: workflowres });
  } catch (error: any) {
    console.error("AI Agent error:", error);

    const status = error.status || 500;
    const message = {
      message:
        error.message ||
        "Something went wrong with getting the Ai Agent response",
    };

    res.status(status).json(message);
  }
});

export default router;
