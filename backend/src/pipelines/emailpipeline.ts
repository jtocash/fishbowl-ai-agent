import { runWorkflow } from "../agent/main";
import { msGraphService } from "../services/msgraph.service";
import { config } from "../config/environment";

export async function runEmailPipeline(messageId: string) {
  try {
    const messageobj = await msGraphService.getEmailConversation(messageId);
    const botEmail = config.graph.userEmail;

    // Filter out bot's own messages and get the latest user message
    const userMessages = messageobj.filter(email => email.from !== botEmail);
    const latestUserMessage = userMessages[userMessages.length - 1];

    if (!latestUserMessage) {
      console.log("No user messages found in conversation");
      return;
    }

    let agentinput = "";
    for (const email of messageobj) {
      agentinput += `From: ${email.from} \n \n`;
      agentinput += `Subject: ${email.subject} \n \n`;
      agentinput += `Body: ${email.body} \n \n`;
      agentinput += `................................ NEXT EMAIL IN CHAIN ................................ \n \n`;
    }

    const agentResponse = await runWorkflow({ input_as_text: agentinput });
    if (!agentResponse) {
      throw new Error("Agent response is undefined");
    }

    // Reply to the latest user message (not the bot's own messages)
    await msGraphService.replyToEmail(latestUserMessage.id, agentResponse.output_text);
  } catch (error: any) {
    console.log(`Error running the email pipeline: ${error.message}`);
  }
}
