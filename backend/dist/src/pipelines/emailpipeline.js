"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runEmailPipeline = runEmailPipeline;
const aiagent_service_1 = require("../services/aiagent.service");
const msgraph_service_1 = require("../services/msgraph.service");
async function runEmailPipeline(messageId) {
    try {
        const messageobj = await msgraph_service_1.msGraphService.getEmailConversation(messageId);
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
        const agentResponse = await (0, aiagent_service_1.runWorkflow)({ input_as_text: agentinput });
        // Use the latest message's actual ID instead of the webhook notification ID
        msgraph_service_1.msGraphService.replyToEmail(latestMessage.id, agentResponse);
    }
    catch (error) {
        console.log(`Error running the email pipeline: ${error.message}`);
    }
}
//# sourceMappingURL=emailpipeline.js.map