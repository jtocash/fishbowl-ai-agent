"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runWorkflow = void 0;
const agents_1 = require("@openai/agents");
const zod_1 = require("zod");
const fishbowl_service_1 = require("./fishbowl.service");
const fuzzymatch_1 = require("../utility/fuzzymatch");
// Tool definitions
const getTableByPartNumber = (0, agents_1.tool)({
    name: "getTableByPartNumber",
    description: "Retrieve the table associated with a specified part number.",
    parameters: zod_1.z.object({
        part_number: zod_1.z.string(),
    }),
    execute: async (input) => {
        try {
            return await fishbowl_service_1.fishbowlService.seeTable(input.part_number);
        }
        catch (error) {
            console.error("Tool error - getTableByPartNumber:", error.message);
            throw error; // Re-throw so agent sees the error
        }
    },
});
const fuzzyMatchPartNumbers = (0, agents_1.tool)({
    name: "fuzzyMatchPartNumbers",
    description: "Run fuzzy matching on an input string against all part numbers and return the 5 closest matches",
    parameters: zod_1.z.object({
        input_string: zod_1.z.string(),
    }),
    execute: async (input) => {
        try {
            return (0, fuzzymatch_1.fuzzyMatchInputToPartNum)(input.input_string);
        }
        catch (error) {
            console.error("Tool error - fuzzyMatchPartNumbers:", error.message, error);
            throw error;
        }
    },
});
const fileSearch = (0, agents_1.fileSearchTool)(["vs_6900ef47ff30819188007e46909d5374"]);
const getPartNumber = new agents_1.Agent({
    name: "Get part number",
    instructions: "You are a professional and helpful assistant. Your only capability is to access inventory counts. You cannot perform any other actions, access other systems, or make assumptions about capabilities you do not have. If the customer request relates to inventory, use your tools to find and provide the correct information. If the request is unclear, or if it asks for something beyond your ability (such as creating, editing, deleting, or ordering items), politely explain that you cannot do that. If the request involves fuzzy or partial matches and the intent is obvious, respond using the closest available match. If no reasonable match is found, try to use filesearch to find the SKU, if you can't find a reasonable mathc there, ask for clarification. All responses must be written in the style of a polite business email. Do not include a subject line. Sign the email with your name being 'Integrations'.   Do not claim or imply that you can do anything beyond checking inventory counts. Refer to RWI11 condition as New, list condition like [Unit number] - [Inventory count] [condiiton].",
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
// Main code entrypoint
const runWorkflow = async (workflow) => {
    try {
        return await (0, agents_1.withTrace)("fishbowl agent test", async () => {
            const state = {};
            const conversationHistory = [
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
            const runner = new agents_1.Runner({
                traceMetadata: {
                    __trace_source__: "agent-builder",
                    workflow_id: "wf_68ef23b0b158819084d92dfaa1b11d7f0d9a7e39776394e5",
                },
            });
            const getPartNumberResultTemp = await runner.run(getPartNumber, [
                ...conversationHistory,
            ]);
            conversationHistory.push(...getPartNumberResultTemp.newItems.map((item) => item.rawItem));
            if (!getPartNumberResultTemp.finalOutput) {
                throw new Error("Agent result is undefined");
            }
            const getPartNumberResult = {
                output_text: getPartNumberResultTemp.finalOutput ?? "",
            };
            return getPartNumberResult.output_text;
        });
    }
    catch (error) {
        console.error("Workflow execution error:", error.message);
        throw error;
    }
};
exports.runWorkflow = runWorkflow;
//# sourceMappingURL=aiagent.service.js.map