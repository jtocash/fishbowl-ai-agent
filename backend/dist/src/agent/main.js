"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.runWorkflow = void 0;
const agents_1 = require("@openai/agents");
const agents = __importStar(require("./agents"));
const runWorkflow = async (workflow) => {
    return await (0, agents_1.withTrace)("Email Agent v2", async () => {
        const conversationHistory = [
            { role: "user", content: [{ type: "input_text", text: workflow.input_as_text }] }
        ];
        const runner = new agents_1.Runner({
            traceMetadata: {
                __trace_source__: "agent-builder",
                workflow_id: "wf_69711a48abf48190b3ca78a45a3e923702db72b128fedeae"
            }
        });
        const classifyInput = workflow.input_as_text;
        const classifyResultTemp = await runner.run(agents.classify, [
            { role: "user", content: [{ type: "input_text", text: `${classifyInput}` }] }
        ], { maxTurns: 20 });
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
            const classifyResultTemp1 = await runner.run(agents.classify1, [
                { role: "user", content: [{ type: "input_text", text: `${classifyInput1}` }] }
            ], { maxTurns: 20 });
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
                const findInventoryResultTemp = await runner.run(agents.findInventory, [
                    ...conversationHistory
                ], { maxTurns: 20 });
                conversationHistory.push(...findInventoryResultTemp.newItems.map((item) => item.rawItem));
                if (!findInventoryResultTemp.finalOutput) {
                    throw new Error("Agent result is undefined");
                }
                const findInventoryResult = {
                    output_text: findInventoryResultTemp.finalOutput ?? ""
                };
                return findInventoryResult;
            }
            else {
                const findMpnResultTemp = await runner.run(agents.findMpn, [
                    ...conversationHistory
                ], { maxTurns: 20 });
                conversationHistory.push(...findMpnResultTemp.newItems.map((item) => item.rawItem));
                if (!findMpnResultTemp.finalOutput) {
                    throw new Error("Agent result is undefined");
                }
                const findMpnResult = {
                    output_text: findMpnResultTemp.finalOutput ?? ""
                };
                const findInventoryResultTemp = await runner.run(agents.findInventory, [
                    ...conversationHistory
                ], { maxTurns: 20 });
                conversationHistory.push(...findInventoryResultTemp.newItems.map((item) => item.rawItem));
                if (!findInventoryResultTemp.finalOutput) {
                    throw new Error("Agent result is undefined");
                }
                const findInventoryResult = {
                    output_text: findInventoryResultTemp.finalOutput ?? ""
                };
                return findInventoryResult;
            }
        }
        else if (classifyCategory == "Product specification request") {
            const giveProductInformationResultTemp = await runner.run(agents.giveProductInformation, [
                ...conversationHistory
            ], { maxTurns: 20 });
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
            const unableToHandleRequestResultTemp = await runner.run(agents.unableToHandleRequest, [
                ...conversationHistory
            ]);
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
};
exports.runWorkflow = runWorkflow;
//# sourceMappingURL=main.js.map