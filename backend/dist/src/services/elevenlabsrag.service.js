"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.elevenLabsRagService = exports.ElevenLabsRagService = void 0;
const environment_1 = require("../config/environment");
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const jsontohtml_1 = require("../utility/jsontohtml");
class ElevenLabsRagService {
    constructor() {
        this.APIKEY = environment_1.config.ElevenLabs.apiKey;
    }
    uploadFile(input) {
        const formData = new form_data_1.default();
        formData.append('file', (0, jsontohtml_1.jsonToHtml)(input), {
            filename: 'rag.html',
            contentType: 'text/html'
        });
        try {
            axios_1.default.post('https://api.elevenlabs.io/v1/convai/knowledge-base/text', formData, {
                headers: {
                    'xi-api-key': this.APIKEY,
                    "Content-Type": 'multipart/form-data'
                }
            });
        }
        catch (error) {
            console.log('Error uploading Elevenlabs RAG file');
        }
    }
    deleteFile(key) {
    }
    listFiles() {
        axios_1.default.get('https://api.elevenlabs.io/v1/convai/knowledge-base', {
            headers: {
                'xi-api-key': this.APIKEY
            }
        });
    }
}
exports.ElevenLabsRagService = ElevenLabsRagService;
exports.elevenLabsRagService = new ElevenLabsRagService();
//# sourceMappingURL=elevenlabsrag.service.js.map