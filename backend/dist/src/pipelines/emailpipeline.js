"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runEmailPipeline = runEmailPipeline;
const main_1 = require("../agent/main");
const msgraph_service_1 = require("../services/msgraph.service");
const environment_1 = require("../config/environment");
async function runEmailPipeline(messageId) {
    try {
        const messageobj = await msgraph_service_1.msGraphService.getEmailConversation(messageId);
        const botEmail = environment_1.config.graph.userEmail;
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
        const agentResponse = await (0, main_1.runWorkflow)({ input_as_text: agentinput });
        if (!agentResponse) {
            throw new Error("Agent response is undefined");
        }
        // Reply to the latest user message (not the bot's own messages)
        await msgraph_service_1.msGraphService.replyToEmail(latestUserMessage.id, agentResponse.output_text);
    }
    catch (error) {
        console.log(`Error running the email pipeline: ${error.message}`);
    }
}
//# sourceMappingURL=emailpipeline.js.map