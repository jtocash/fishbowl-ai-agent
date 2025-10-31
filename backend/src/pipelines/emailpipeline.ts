import { runWorkflow } from "../services/aiagent.service";
import { msGraphService } from "../services/msgraph.service";

export async function runEmailPipeline(messageId: string) {
  try {
    const messageobj = await msGraphService.getEmailConversation(messageId);

    // Get the actual latest message ID from the conversation
    const latestMessage = messageobj[messageobj.length - 1];

    let agentinput = "";
    let from;
    for (const email of messageobj) {
      agentinput += `From: ${email.from} \n \n`;
      agentinput += `Subject: ${email.subject} \n \n`;
      agentinput += `Body: ${email.body} \n \n`;
      agentinput += `................................ NEXT EMAIL IN CHAIN ................................ \n \n`;
      from = email.from;
    }

    const agentResponse = await runWorkflow({ input_as_text: agentinput });

    // Use the latest message's actual ID instead of the webhook notification ID
    msGraphService.replyToEmail(latestMessage.id, agentResponse);
  } catch (error: any) {
    console.log(`Error running the email pipeline: ${error.message}`);
  }
}
