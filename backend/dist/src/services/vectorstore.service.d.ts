import { ListFilesResponse } from "../types/vectorstore.types";
import { OpenAIClientService } from "./openaiclient.service";
declare class VectorStoreService extends OpenAIClientService {
    private vectorStoreId;
    addFile(fileId: string): Promise<any>;
    listFiles(): Promise<ListFilesResponse>;
    deleteFileFromVectorStore(fileId: string): Promise<any>;
    updateVectorStore(): Promise<{
        success: boolean;
        fileId: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        fileId?: undefined;
    }>;
}
export declare const vectorStoreService: VectorStoreService;
export {};
//# sourceMappingURL=vectorstore.service.d.ts.map