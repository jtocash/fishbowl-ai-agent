import axios from "axios";
import { OpenAIClientService } from "./openaiclient.service";
import { OpenAIFileResponse } from "../types/vectorstore.types";
import FormData from "form-data";

export class OpenAIFileService extends OpenAIClientService {
  public async createFileFromJSON(JSONString: string): Promise<string> {
    try {
      const formData = new FormData();
      formData.append("purpose", "assistants");
      formData.append("file", Buffer.from(JSONString), {
        filename: `mydata-${Date.now()}.json`,
        contentType: "application/jsonl",
      });

      const response = await axios.post<OpenAIFileResponse>(
        "https://api.openai.com/v1/files",
        formData,
        {
          headers: {
            Authorization: `Bearer ${this.openAiApiKey}`,
            ...formData.getHeaders(),
          },
        }
      );
      return response.data.id;
    } catch (error: any) {
      console.error(`Error creating JSON file in OpenAI: ${error.message}`);
      console.error("Response data:", error.response?.data); // Add this
      console.error("Status:", error.response?.status); // Add this
      throw error;
    }
  }

  public async deleteFile(fileId: string) {
    try {
      const response = await axios.delete(
        `https://api.openai.com/v1/files/${fileId}`,
        {
          headers: this.getHeaders(),
        }
      );
      if (response.data.deleted != true) {
        throw new Error(`file ${fileId} not successfully deleted`);
      }
      return response.data;
    } catch (error: any) {
      console.error(`Error deleting file from OpenAI: ${error.message}`);
      throw error;
    }
  }
}

export const openAIFileService = new OpenAIFileService();
