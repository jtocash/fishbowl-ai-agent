import { OpenAIClientService } from "./openaiclient.service";
export declare class OpenAIFileService extends OpenAIClientService {
    createFileFromJSON(JSONString: string): Promise<string>;
    deleteFile(fileId: string): Promise<any>;
}
export declare const openAIFileService: OpenAIFileService;
//# sourceMappingURL=openaifile.service.d.ts.map