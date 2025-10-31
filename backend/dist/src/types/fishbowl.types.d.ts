export interface FishbowlUser {
    id: number;
    userFullName: string;
    moduleAccessList: string[];
    serverVersion: string;
}
export type InventoryEntry = {
    "Part Number": string;
    Condition: string;
    Qty: number;
};
export type InventoryTable = InventoryEntry[];
//# sourceMappingURL=fishbowl.types.d.ts.map