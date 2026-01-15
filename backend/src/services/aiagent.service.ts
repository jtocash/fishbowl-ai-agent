import {
  tool,
  fileSearchTool,
  Agent,
  AgentInputItem,
  Runner,
  withTrace,
} from "@openai/agents";
import { z } from "zod";
import { fishbowlService } from "./fishbowl.service";
import { fuzzyMatchInputToPartNum } from "../utility/fuzzymatch";

// Tool definitions
const getTableByPartNumber = tool({
  name: "getTableByPartNumber",
  description: "Retrieve the table associated with a specified part number.",
  parameters: z.object({
    part_number: z.string(),
  }),
  execute: async (input: { part_number: string }) => {
    try {
      return await fishbowlService.seeTable(input.part_number);
    } catch (error: any) {
      console.error("Tool error - getTableByPartNumber:", error.message);
      throw error;
    }
  },
});

const fuzzyMatchPartNumbers = tool({
  name: "fuzzyMatchPartNumbers",
  description:
    "Run fuzzy matching on an input string against all part numbers and return the 5 closest matches",
  parameters: z.object({
    input_string: z.string(),
  }),
  execute: async (input: { input_string: string }) => {
    try {
      return fuzzyMatchInputToPartNum(input.input_string);
    } catch (error: any) {
      console.error(
        "Tool error - fuzzyMatchPartNumbers:",
        error.message,
        error
      );
      throw error;
    }
  },
});

const fileSearch = fileSearchTool(["vs_6900ef47ff30819188007e46909d5374"]);

const getPartNumber = new Agent({
  name: "Get part number",
  instructions:
    "You are a professional and helpful assistant. Your only capability is to access inventory counts. You cannot perform any other actions, access other systems, or make assumptions about capabilities you do not have. If the customer request relates to inventory, use your tools to find and provide the correct information. If the request is unclear, or if it asks for something beyond your ability (such as creating, editing, deleting, or ordering items), politely explain that you cannot do that. If the request involves fuzzy or partial matches and the intent is obvious, respond using the closest available match. If no reasonable match is found, try to use filesearch to find the SKU, if you can't find a reasonable mathc there, ask for clarification. All responses must be written in the style of a polite business email. Do not include a subject line. Sign the email with your name being 'Integrations'.   Do not claim or imply that you can do anything beyond checking the current inventory counts. You cannot check location or other information regarding the inventory. Just number and condition.  If you cannot authenticate, do not retry.",
  model: "gpt-5-nano-2025-08-07",
  tools: [getTableByPartNumber, fuzzyMatchPartNumbers, fileSearch],
  modelSettings: {
    parallelToolCalls: true,
    reasoning: {
      effort: "medium",
    },
    store: true,
  },
});

// const redirector = new Agent({
//   name: "Redirector",
//   instructions: `You are a professional and helpful assistant.  All responses must be written in the style of a polite business email. Do not include a subject line. Sign the email with your name being 'Integrations'.  

// Judge if the email responds to the user's request, if it does, change nothing, otherwise:
// Tell the user you're sorry you cannot fulfill their request right now due to being currently unable to access the necessary resources and they can email placeholder@renewedwarehouse.com to fulfill their request or email you back later`,
//   model: "gpt-4.1-nano",
//   modelSettings: {
//     temperature: 1,
//     topP: 1,
//     maxTokens: 2048,
//     store: true,
//   },
// });

type WorkflowInput = { input_as_text: string };

// Main code entrypoint
export const runWorkflow = async (workflow: WorkflowInput) => {
  return await withTrace("fishbowl agent test", async () => {
    const state = {};
    // 1. the initial message gets pushed to conversation history
    const conversationHistory: AgentInputItem[] = [
      {
        role: "user",
        content: [{ type: "input_text", text: workflow.input_as_text }],
      },
    ];
    const runner = new Runner({
      traceMetadata: {
        __trace_source__: "agent-builder",
        workflow_id: "wf_68ef23b0b158819084d92dfaa1b11d7f0d9a7e39776394e5",
      },
    });
    // 2. the getPartNumber agent is run with the conversation history
    const getPartNumberResultTemp = await runner.run(getPartNumber, [
      ...conversationHistory,
    ]);
    // 3. the getPartNumber agent's response is pushed to conversation history
    conversationHistory.push(
      ...getPartNumberResultTemp.newItems.map((item) => item.rawItem)
    );

    if (!getPartNumberResultTemp.finalOutput) {
      throw new Error("Agent result is undefined");
    }

    const getPartNumberResult = {
      output_text: getPartNumberResultTemp.finalOutput ?? "",
    };
    // const redirectorResultTemp = await runner.run(redirector, [
    //   ...conversationHistory,
    // ]);
    // conversationHistory.push(
    //   ...redirectorResultTemp.newItems.map((item) => item.rawItem)
    // );

    // if (!redirectorResultTemp.finalOutput) {
    //   throw new Error("Agent result is undefined");
    // }

    // const redirectorResult = {
    //   output_text: redirectorResultTemp.finalOutput ?? "",
    // };
    // return redirectorResult;
    return getPartNumberResult;
  });
};
