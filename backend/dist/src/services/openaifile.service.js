"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openAIFileService = exports.OpenAIFileService = void 0;
const axios_1 = __importDefault(require("axios"));
const openaiclient_service_1 = require("./openaiclient.service");
const form_data_1 = __importDefault(require("form-data"));
class OpenAIFileService extends openaiclient_service_1.OpenAIClientService {
    async createFileFromJSON(JSONString) {
        try {
            const formData = new form_data_1.default();
            formData.append("purpose", "assistants");
            formData.append("file", Buffer.from(JSONString), {
                filename: `mydata-${Date.now()}.json`,
                contentType: "application/jsonl",
            });
            const response = await axios_1.default.post("https://api.openai.com/v1/files", formData, {
                headers: {
                    Authorization: `Bearer ${this.openAiApiKey}`,
                    ...formData.getHeaders(),
                },
            });
            return response.data.id;
        }
        catch (error) {
            console.error(`Error creating JSON file in OpenAI: ${error.message}`);
            console.error("Response data:", error.response?.data); // Add this
            console.error("Status:", error.response?.status); // Add this
            throw error;
        }
    }
    async deleteFile(fileId) {
        try {
            const response = await axios_1.default.delete(`https://api.openai.com/v1/files/${fileId}`, {
                headers: this.getHeaders(),
            });
            if (response.data.deleted != true) {
                throw new Error(`file ${fileId} not successfully deleted`);
            }
            return response.data;
        }
        catch (error) {
            console.error(`Error deleting file from OpenAI: ${error.message}`);
            throw error;
        }
    }
}
exports.OpenAIFileService = OpenAIFileService;
exports.openAIFileService = new OpenAIFileService();
//# sourceMappingURL=openaifile.service.js.map