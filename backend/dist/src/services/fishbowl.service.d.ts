import { InventoryTable } from "../types/fishbowl.types";
export declare class FishbowlService {
    private static instance;
    private token;
    private tokenPromise;
    private constructor();
    static getInstance(): FishbowlService;
    getToken(): Promise<string | null>;
    private loadOrCreateToken;
    private loadTokenFromFile;
    private saveTokenToFile;
    private validateToken;
    private login;
    getInventory(): Promise<any>;
    seeTable(partNumber: string): Promise<InventoryTable>;
    getAllActivePartNums(): Promise<string[]>;
}
//# sourceMappingURL=fishbowl.service.d.ts.map