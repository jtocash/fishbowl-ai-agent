import {
  tool,
  Agent,
  AgentInputItem,
  Runner,
  withTrace,
  fileSearchTool,
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
      throw error; // Re-throw so agent sees the error
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
    "You are a professional and helpful assistant. Your only capability is to access inventory counts. You cannot perform any other actions, access other systems, or make assumptions about capabilities you do not have. If the customer request relates to inventory, use your tools to find and provide the correct information. If the request is unclear, or if it asks for something beyond your ability (such as creating, editing, deleting, or ordering items), politely explain that you cannot do that. If the request involves fuzzy or partial matches and the intent is obvious, respond using the closest available match. If no reasonable match is found, try to use filesearch to find the SKU, if you can't find a reasonable mathc there, ask for clarification. All responses must be written in the style of a polite business email. Do not include a subject line. Sign the email with your name being 'Integrations'.   Do not claim or imply that you can do anything beyond checking inventory counts. Refer to RWI11 condition as New, list condition like [Unit number] - [Inventory count] [condiiton].",
  model: "gpt-5",
  tools: [getTableByPartNumber, fuzzyMatchPartNumbers, fileSearch],
  modelSettings: {
    parallelToolCalls: true,
    reasoning: {
      effort: "low",
    },
    store: true,
  },
});

type WorkflowInput = { input_as_text: string };

// Main code entrypoint
export const runWorkflow = async (workflow: WorkflowInput) => {
  try {
    return await withTrace("fishbowl agent test", async () => {
      const state = {};
      const conversationHistory: AgentInputItem[] = [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: workflow.input_as_text,
            },
          ],
        },
      ];
      const runner = new Runner({
        traceMetadata: {
          __trace_source__: "agent-builder",
          workflow_id: "wf_68ef23b0b158819084d92dfaa1b11d7f0d9a7e39776394e5",
        },
      });
      const getPartNumberResultTemp = await runner.run(getPartNumber, [
        ...conversationHistory,
      ]);
      conversationHistory.push(
        ...getPartNumberResultTemp.newItems.map((item) => item.rawItem)
      );

      if (!getPartNumberResultTemp.finalOutput) {
        throw new Error("Agent result is undefined");
      }

      const getPartNumberResult = {
        output_text: getPartNumberResultTemp.finalOutput ?? "",
      };
      return getPartNumberResult.output_text;
    });
  } catch (error: any) {
    console.error("Workflow execution error:", error.message);
    throw error;
  }
};
