"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.vectorStoreService = void 0;
const environment_1 = require("../config/environment");
const axios_1 = __importDefault(require("axios"));
const fishbowl_service_1 = require("./fishbowl.service");
const openaiclient_service_1 = require("./openaiclient.service");
const openaifile_service_1 = require("./openaifile.service");
class VectorStoreService extends openaiclient_service_1.OpenAIClientService {
    constructor() {
        super(...arguments);
        this.vectorStoreId = environment_1.config.OpenAI.vectorStoreId;
    }
    async addFile(fileId) {
        try {
            const response = await axios_1.default.post(`https://api.openai.com/v1/vector_stores/${this.vectorStoreId}/files`, { file_id: fileId }, {
                headers: this.getHeaders({ "OpenAI-Beta": "assistants=v2" }),
            });
            console.log(response.data);
            return response.data;
        }
        catch (error) {
            console.log(`Error adding file to vector store: ${error.message}`);
            throw error;
        }
    }
    async listFiles() {
        try {
            const response = await axios_1.default.get(`https://api.openai.com/v1/vector_stores/${this.vectorStoreId}/files`, {
                headers: this.getHeaders({ "OpenAI-Beta": "assistants=v2" }),
            });
            return response.data;
        }
        catch (error) {
            console.log(`Error listings files in vector store: ${error.message}`);
            throw error;
        }
    }
    async deleteFileFromVectorStore(fileId) {
        try {
            const response = await axios_1.default.delete(`https://api.openai.com/v1/vector_stores/${this.vectorStoreId}/files/${fileId}`, {
                headers: this.getHeaders({ "OpenAI-Beta": "assistants=v2" }),
            });
            return response.data;
        }
        catch (error) {
            console.log(`Error deleting file from vector store: ${error.message}`);
            throw error;
        }
    }
    async updateVectorStore() {
        try {
            const files = await this.listFiles();
            if (files.data && files.data.length > 0) {
                const oldfileid = files.data[0].id;
                await this.deleteFileFromVectorStore(oldfileid);
                await openaifile_service_1.openAIFileService.deleteFile(oldfileid);
            }
            const partswithdesc = await fishbowl_service_1.fishbowlService.getAllPartNumsWithDescription();
            const jsonpartswithdesc = JSON.stringify(partswithdesc);
            // Save locally
            // const localPath = path.join(__dirname, "../../data/parts.json");
            // fs.mkdirSync(path.dirname(localPath), { recursive: true });
            // fs.writeFileSync(localPath, jsonpartswithdesc);
            // console.log(`Saved parts JSON locally to ${localPath}`);
            const newfileid = await openaifile_service_1.openAIFileService.createFileFromJSON(jsonpartswithdesc);
            await this.addFile(newfileid);
            return { success: true, fileId: newfileid };
        }
        catch (error) {
            console.error(`Error updating vector store: ${error.message}`);
            return { success: false, error: error.message };
        }
    }
}
exports.vectorStoreService = new VectorStoreService();
//# sourceMappingURL=vectorstore.service.js.map