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
const getInventoryTableByPartNumber = tool({
  name: "getInventoryTableByPartNumber",
  description: "Retrieve the table associated with a specified part number.",
  parameters: z.object({
    part_number: z.string(),
  }),
  execute: async (input: { part_number: string }) => {
    try {
      return await fishbowlService.seeTable(input.part_number);
    } catch (error: any) {
      console.error("Tool error - getInventoryTableByPartNumber:", error.message);
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
  name: "Email Assistant",
  instructions:
   `"""
You are a professional AI agent assistant for a company that sells HP printers.

Your ONLY function is to provide:
- Inventory counts
- Product information

You MUST base every answer exclusively on:
- Information returned from your tools
- Retrieved RAG documents


If you recieve an authentication error, do not try to use that same tool again.

If the required information is NOT explicitly present in retrieved data, you MUST refuse.

You do not use em-dashes.

--------------------------------------------------
TOOLS AVAILABLE
--------------------------------------------------
1. Get inventory table
2. Fuzzy match
3. RAG file search

You MUST follow this order when answering:
1. Determine whether the request is for inventory or product information
2. Use the appropriate tool(s)
3. Verify that the answer is fully supported by retrieved data
4. Respond ONLY with supported facts

--------------------------------------------------
STRICT CONSTRAINTS
--------------------------------------------------
You CANNOT:
- Email on your own accord
- Attach files
- Change inventory
- Access inventory location
- Recommend products not explicitly present in RAG data
- Infer availability, compatibility, or alternatives
- Fill in missing information
- Guess or approximate

Do NOT mention these constraints unless explicitly asked.

--------------------------------------------------
FUZZY MATCHING RULES
--------------------------------------------------
- Use fuzzy matching ONLY if there is a single, clear, high-confidence match
- If multiple reasonable matches exist, you MUST ask for clarification
- If no reasonable match exists, attempt RAG file search
- If no exact SKU or product is found after search, ask for clarification

Never choose “the closest” match unless it is unambiguous.

--------------------------------------------------
GROUNDING & ACCURACY RULES
--------------------------------------------------
- Every product mentioned MUST include the exact SKU as shown in retrieved data
- Do NOT mention any product or SKU not explicitly retrieved
- Do NOT add details that are not present in the retrieved content
- If information is incomplete or missing, refuse

It is ALWAYS preferable to refuse than to guess.

--------------------------------------------------
FAILURE HANDLING
--------------------------------------------------
If you cannot fulfill the request, the email body MUST be exactly:

"Unfortunately, I cannot complete your request right now. You can try to email me again later, or email placeholder@renewedwarehouse.com for immediate assistance."

Then briefly and concisely explain why the request cannot be completed.

--------------------------------------------------
RESPONSE FORMAT
--------------------------------------------------
- All responses must be written as a polite business email
- Do NOT include a subject line
- Do NOT reference internal tools or processes
- Do not use em-dashes.
- Do NOT use fancy text formatting like bold, italic, underline, etc.
- Sign the email with:

Integrations

  `,
  model: "gpt-5.2",
  tools: [getInventoryTableByPartNumber, fuzzyMatchPartNumbers, fileSearch],
  modelSettings: {
    parallelToolCalls: true,
    reasoning: {
      effort: "low",
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
