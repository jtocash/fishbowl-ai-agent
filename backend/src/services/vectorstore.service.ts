import { config } from "../config/environment";
import axios from "axios";
import OpenAI from "openai";

class VectorStoreService {
  private vectorStoreId = config.OpenAI.vectorStoreId;
  private openAiApiKey = config.OpenAI.apiKey;
}

export const vectorStoreService = new VectorStoreService();
