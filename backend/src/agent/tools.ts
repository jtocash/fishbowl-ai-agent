import { tool, fileSearchTool, webSearchTool, Agent, AgentInputItem, Runner, withTrace } from "@openai/agents";
import { z } from "zod";
import { fuzzyMatchInputToPartNum } from "../utility/fuzzymatch";
import { fishbowlService } from "../services/fishbowl.service"

// Tool definitions
export const getInventoryTableByPartNumber = tool({
    name: "getInventoryTableByPartNumber",
    description: "Retrieve the table associated with a specified part number.",
    parameters: z.object({
        part_number: z.string()
    }),
    execute: async (input: { part_number: string }) => {
        return await fishbowlService.seeTable(input.part_number);
    },
});
export const fuzzyMatchPartNumbers = tool({
    name: "fuzzyMatchMPNs",
    description: "Run fuzzy matching on an input string against all MPNs and return the 5 closest matches",
    parameters: z.object({
        input_string: z.string()
    }),
    execute: async (input: { input_string: string }) => {
        return await fuzzyMatchInputToPartNum(input.input_string);
    },
});
export const fileSearch = fileSearchTool([
    "vs_6900ef47ff30819188007e46909d5374"
])
export const webSearchPreview = webSearchTool({
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
})
