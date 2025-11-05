"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vectorStoreService = void 0;
const environment_1 = require("../config/environment");
class VectorStoreService {
    constructor() {
        this.vectorStoreId = environment_1.config.OpenAI.vectorStoreId;
        this.openAiApiKey = environment_1.config.OpenAI.apiKey;
    }
}
exports.vectorStoreService = new VectorStoreService();
//# sourceMappingURL=vectorstore.service.js.map