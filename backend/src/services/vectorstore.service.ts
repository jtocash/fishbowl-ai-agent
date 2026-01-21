import { config } from "../config/environment";
import axios from "axios";
import fs from "fs";
import path from "path";
import { ListFilesResponse } from "../types/vectorstore.types";
import { fishbowlService } from "./fishbowl.service";
import { OpenAIClientService } from "./openaiclient.service";
import { openAIFileService } from "./openaifile.service";

class VectorStoreService extends OpenAIClientService {
  private vectorStoreId: string = config.OpenAI.vectorStoreId;

  public async addFile(fileId: string) {
    try {
      const response = await axios.post(
        `https://api.openai.com/v1/vector_stores/${this.vectorStoreId}/files`,
        { file_id: fileId },
        {
          headers: this.getHeaders({ "OpenAI-Beta": "assistants=v2" }),
        }
      );
      console.log(response.data);
      return response.data;
    } catch (error: any) {
      console.log(`Error adding file to vector store: ${error.message}`);
      throw error;
    }
  }

  public async listFiles(): Promise<ListFilesResponse> {
    try {
      const response = await axios.get<ListFilesResponse>(
        `https://api.openai.com/v1/vector_stores/${this.vectorStoreId}/files`,
        {
          headers: this.getHeaders({ "OpenAI-Beta": "assistants=v2" }),
        }
      );
      return response.data;
    } catch (error: any) {
      console.log(`Error listings files in vector store: ${error.message}`);
      throw error;
    }
  }

  public async deleteFileFromVectorStore(fileId: string) {
    try {
      const response = await axios.delete(
        `https://api.openai.com/v1/vector_stores/${this.vectorStoreId}/files/${fileId}`,
        {
          headers: this.getHeaders({ "OpenAI-Beta": "assistants=v2" }),
        }
      );
      return response.data;
    } catch (error: any) {
      console.log(`Error deleting file from vector store: ${error.message}`);
      throw error;
    }
  }

  public async updateVectorStore() {
    try {
      const files = await this.listFiles();

      if (files.data && files.data.length > 0) {
        const oldfileid = files.data[0].id;
        await this.deleteFileFromVectorStore(oldfileid);
        await openAIFileService.deleteFile(oldfileid);
      }

      const partswithdesc =
        await fishbowlService.getAllPartNumsWithDescription();
      const jsonpartswithdesc = JSON.stringify(partswithdesc);
        // Save locally
        // const localPath = path.join(__dirname, "../../data/parts.json");
        // fs.mkdirSync(path.dirname(localPath), { recursive: true });
        // fs.writeFileSync(localPath, jsonpartswithdesc);
        // console.log(`Saved parts JSON locally to ${localPath}`);
      const newfileid =
        await openAIFileService.createFileFromJSON(jsonpartswithdesc);
      await this.addFile(newfileid);

      return { success: true, fileId: newfileid };
    } catch (error: any) {
      console.error(`Error updating vector store: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}

export const vectorStoreService = new VectorStoreService();
