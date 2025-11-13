import { InventoryTable } from "../types/fishbowl.types";
export declare class FishbowlService {
    private static instance;
    private token;
    private tokenPromise;
    private constructor();
    static getInstance(): FishbowlService;
    getToken(): Promise<string | null>;
    expireToken(): void;
    private makeAuthenticatedRequest;
    private loadOrCreateToken;
    private loadTokenFromFile;
    private deleteTokenFile;
    private saveTokenToFile;
    private validateToken;
    login(): Promise<string | null>;
    seeTable(partNumber: string): Promise<InventoryTable>;
    getAllActivePartNums(): Promise<string[]>;
    logOut(): Promise<import("axios").AxiosResponse<any, any, {}>>;
}
export declare const fishbowlService: FishbowlService;
//# sourceMappingURL=fishbowl.service.d.ts.map