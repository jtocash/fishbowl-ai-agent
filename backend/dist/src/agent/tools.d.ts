import { z } from "zod";
export declare const getInventoryTableByPartNumber: import("@openai/agents").FunctionTool<unknown, z.ZodObject<{
    part_number: z.ZodString;
}, "strip", z.ZodTypeAny, {
    part_number: string;
}, {
    part_number: string;
}>, string>;
export declare const fuzzyMatchPartNumbers: import("@openai/agents").FunctionTool<unknown, z.ZodObject<{
    input_string: z.ZodString;
}, "strip", z.ZodTypeAny, {
    input_string: string;
}, {
    input_string: string;
}>, string>;
export declare const fileSearch: import("@openai/agents").HostedTool;
export declare const webSearchPreview: import("@openai/agents").HostedTool;
//# sourceMappingURL=tools.d.ts.map