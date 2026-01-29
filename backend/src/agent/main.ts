import { AgentInputItem, Runner, withTrace } from "@openai/agents";
import * as agents from "./agents"



type WorkflowInput = { input_as_text: string };


export const runWorkflow = async (workflow: WorkflowInput) => {
  return await withTrace("Email Agent v2", async () => {
    const conversationHistory: AgentInputItem[] = [
      { role: "user", content: [{ type: "input_text", text: workflow.input_as_text }] }
    ];
    const runner = new Runner({
      traceMetadata: {
        __trace_source__: "agent-builder",
        workflow_id: "wf_69711a48abf48190b3ca78a45a3e923702db72b128fedeae"
      }
    });
    const classifyInput = workflow.input_as_text;
    const classifyResultTemp = await runner.run(
      agents.classify,
      [
        { role: "user", content: [{ type: "input_text", text: `${classifyInput}` }] }
      ],
      { maxTurns: 20 }
    );

    if (!classifyResultTemp.finalOutput) {
      throw new Error("Agent result is undefined");
    }

    const classifyResult = {
      output_text: JSON.stringify(classifyResultTemp.finalOutput),
      output_parsed: classifyResultTemp.finalOutput
    };
    const classifyCategory = classifyResult.output_parsed.category;
    const classifyOutput = { "category": classifyCategory };
    if (classifyCategory == "Inventory Request") {
      const classifyInput1 = workflow.input_as_text;
      const classifyResultTemp1 = await runner.run(
        agents.classify1,
        [
          { role: "user", content: [{ type: "input_text", text: `${classifyInput1}` }] }
        ],
        { maxTurns: 20 }
      );

      if (!classifyResultTemp1.finalOutput) {
        throw new Error("Agent result is undefined");
      }

      const classifyResult1 = {
        output_text: JSON.stringify(classifyResultTemp1.finalOutput),
        output_parsed: classifyResultTemp1.finalOutput
      };
      const classifyCategory1 = classifyResult1.output_parsed.category;
      const classifyOutput1 = { "category": classifyCategory1 };
      if (classifyCategory1 == "Has MPN") {
        const findInventoryResultTemp = await runner.run(
          agents.findInventory,
          [
            ...conversationHistory
          ],
          { maxTurns: 20 }
        );
        conversationHistory.push(...findInventoryResultTemp.newItems.map((item) => item.rawItem));

        if (!findInventoryResultTemp.finalOutput) {
          throw new Error("Agent result is undefined");
        }

        const findInventoryResult = {
          output_text: findInventoryResultTemp.finalOutput ?? ""
        };
        return findInventoryResult;
      } else {
        const findMpnResultTemp = await runner.run(
          agents.findMpn,
          [
            ...conversationHistory
          ],
          { maxTurns: 20 }
        );
        conversationHistory.push(...findMpnResultTemp.newItems.map((item) => item.rawItem));

        if (!findMpnResultTemp.finalOutput) {
          throw new Error("Agent result is undefined");
        }

        const findMpnResult = {
          output_text: findMpnResultTemp.finalOutput ?? ""
        };
        const findInventoryResultTemp = await runner.run(
          agents.findInventory,
          [
            ...conversationHistory
          ],
          { maxTurns: 20 }
        );
        conversationHistory.push(...findInventoryResultTemp.newItems.map((item) => item.rawItem));

        if (!findInventoryResultTemp.finalOutput) {
          throw new Error("Agent result is undefined");
        }

        const findInventoryResult = {
          output_text: findInventoryResultTemp.finalOutput ?? ""
        };
        return findInventoryResult;
      }
    } else if (classifyCategory == "Product specification request") {
      const giveProductInformationResultTemp = await runner.run(
        agents.giveProductInformation,
        [
          ...conversationHistory
        ],
        { maxTurns: 20 }
      );
      conversationHistory.push(...giveProductInformationResultTemp.newItems.map((item) => item.rawItem));

      if (!giveProductInformationResultTemp.finalOutput) {
        throw new Error("Agent result is undefined");
      }

      const giveProductInformationResult = {
        output_text: giveProductInformationResultTemp.finalOutput ?? ""
      };
      return giveProductInformationResult;
    }
    else {

      const unableToHandleRequestResultTemp = await runner.run(agents.unableToHandleRequest,
        [
          ...conversationHistory
        ]
      )
      conversationHistory.push(...unableToHandleRequestResultTemp.newItems.map((item) => item.rawItem));

      if (!unableToHandleRequestResultTemp.finalOutput) {
        throw new Error("Agent result is undefined");
      }

      const unableToHandleRequestResult = {
        output_text: unableToHandleRequestResultTemp.finalOutput ?? ""
      };
      return unableToHandleRequestResult;

    }
  });
}
