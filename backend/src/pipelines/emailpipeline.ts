import { processEmail } from "../services/msgraph.service";
import { runAgent } from "../services/aiagent.service";
import { config } from "../config/environment";
import { replyToEmail } from "../services/msgraph.service";

export async function runEmailPipeline(messageId: string) {
  try {
    const messageobj = await processEmail(messageId);
    const { body, from } = messageobj;
    if (from == config.graph.userEmail) {
      console.log("Email from self discarded");
      return;
    }

    const agentResponse = await runAgent({ input_as_text: body });

    replyToEmail(messageId, agentResponse);
  } catch (error: any) {
    console.log(`Error running the email pipeline: ${error.message}`);
  }
}
