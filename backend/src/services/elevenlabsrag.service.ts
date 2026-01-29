import { config } from "../config/environment";
import axios from "axios";
import FormData from 'form-data';
import { jsonToHtml } from "../utility/jsontohtml";
export class ElevenLabsRagService {
    private APIKEY = config.ElevenLabs.apiKey
    public constructor() { }

    public uploadFile(input: Object) {
        const formData = new FormData()
        formData.append('file', jsonToHtml(input), {
            filename: 'rag.html',
            contentType: 'text/html'
        })
        try {
            axios.post('https://api.elevenlabs.io/v1/convai/knowledge-base/text', formData, {
                headers:
                {
                    'xi-api-key': this.APIKEY,
                    "Content-Type": 'multipart/form-data'
                }
            })
        } catch (error: any) {
            console.log('Error uploading Elevenlabs RAG file')

        }



    }

    public deleteFile(key: string) {

    }

    public listFiles() {
        axios.get('https://api.elevenlabs.io/v1/convai/knowledge-base', {
            headers: {
                'xi-api-key': this.APIKEY
            }
        })
    }

}

export const elevenLabsRagService = new ElevenLabsRagService(); 