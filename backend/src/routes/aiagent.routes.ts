import { Router } from "express";
import { FishbowlService } from "../services/fishbowl.service";
import { runWorkflow } from "../services/aiagent.service";

const router = Router();

router.post("/input", async (req, res) => {
  const input = req.body.input as string;
  const workflowres = await runWorkflow({ input_as_text: input });
  res.json({ agentResponse: workflowres });
});

export default router;
