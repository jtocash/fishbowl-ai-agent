"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webSearchPreview = exports.fileSearch = exports.fuzzyMatchPartNumbers = exports.getInventoryTableByPartNumber = void 0;
const agents_1 = require("@openai/agents");
const zod_1 = require("zod");
const fuzzymatch_1 = require("../utility/fuzzymatch");
const fishbowl_service_1 = require("../services/fishbowl.service");
// Tool definitions
exports.getInventoryTableByPartNumber = (0, agents_1.tool)({
    name: "getInventoryTableByPartNumber",
    description: "Retrieve the table associated with a specified part number.",
    parameters: zod_1.z.object({
        part_number: zod_1.z.string()
    }),
    execute: async (input) => {
        return await fishbowl_service_1.fishbowlService.seeTable(input.part_number);
    },
});
exports.fuzzyMatchPartNumbers = (0, agents_1.tool)({
    name: "fuzzyMatchMPNs",
    description: "Run fuzzy matching on an input string against all MPNs and return the 5 closest matches",
    parameters: zod_1.z.object({
        input_string: zod_1.z.string()
    }),
    execute: async (input) => {
        return await (0, fuzzymatch_1.fuzzyMatchInputToPartNum)(input.input_string);
    },
});
exports.fileSearch = (0, agents_1.fileSearchTool)([
    "vs_6900ef47ff30819188007e46909d5374"
]);
exports.webSearchPreview = (0, agents_1.webSearchTool)({
    userLocation: {
        type: "approximate",
        country: undefined,
        region: undefined,
        city: undefined,
        timezone: undefined
    },
    searchContextSize: "medium",
    filters: {
        allowedDomains: [
            "hp.com"
        ]
    }
});
//# sourceMappingURL=tools.js.map