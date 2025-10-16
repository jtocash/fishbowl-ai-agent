import { tool, Agent, AgentInputItem, Runner } from "@openai/agents";
import { z } from "zod";
import { FishbowlService } from "./fishbowl.service";

const fishbowlService = FishbowlService.getInstance();

// Tool definitions
const getTableByPartNumber = tool({
  name: "getTableByPartNumber",
  description: "Retrieve the table associated with a specified part number.",
  parameters: z.object({
    part_number: z.string(),
  }),
  execute: async (input: { part_number: string }) => {
    return await fishbowlService.seeTable(input.part_number);
  },
});
const getPartNumber = new Agent({
  name: "Get part number",
  instructions:
    "You are a helpful assistant.  Identify the part number from the message you are receiving and then find the stock for each condition of that inventory",
  model: "gpt-5-nano",
  tools: [getTableByPartNumber],
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
    ...getPartNumberResultTemp.newItems.map((item: any) => item.rawItem)
  );

  if (!getPartNumberResultTemp.finalOutput) {
    throw new Error("Agent result is undefined");
  }

  const getPartNumberResult = {
    output_text: getPartNumberResultTemp.finalOutput ?? "",
  };

  return getPartNumberResult;
};
