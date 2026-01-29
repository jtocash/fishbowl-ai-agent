import { Agent } from "@openai/agents";
import { z } from "zod";
export declare const classify: Agent<unknown, z.ZodObject<{
    category: z.ZodEnum<["Inventory Request", "Product specification request", "Other Request"]>;
}, "strip", z.ZodTypeAny, {
    category: "Inventory Request" | "Product specification request" | "Other Request";
}, {
    category: "Inventory Request" | "Product specification request" | "Other Request";
}>>;
export declare const classify1: Agent<unknown, z.ZodObject<{
    category: z.ZodEnum<["Has MPN", "Does not have MPN"]>;
}, "strip", z.ZodTypeAny, {
    category: "Has MPN" | "Does not have MPN";
}, {
    category: "Has MPN" | "Does not have MPN";
}>>;
export declare const giveProductInformation: Agent<unknown, "text">;
export declare const findInventory: Agent<unknown, "text">;
export declare const findMpn: Agent<unknown, "text">;
export declare const unableToHandleRequest: Agent<unknown, "text">;
//# sourceMappingURL=agents.d.ts.map