"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIClientService = void 0;
const environment_1 = require("../config/environment");
class OpenAIClientService {
    constructor() {
        this.openAiApiKey = environment_1.config.OpenAI.apiKey;
    }
    getHeaders(additionalHeaders) {
        return {
            Authorization: `Bearer ${this.openAiApiKey}`,
            "Content-Type": "application/json",
            ...additionalHeaders,
        };
    }
}
exports.OpenAIClientService = OpenAIClientService;
//# sourceMappingURL=openaiclient.service.js.map