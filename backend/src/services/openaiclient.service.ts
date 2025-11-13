import { config } from "../config/environment";
import axios from "axios";

export class OpenAIClientService {
  protected openAiApiKey: string = config.OpenAI.apiKey;

  protected getHeaders(additionalHeaders?: Record<string, string>) {
    return {
      Authorization: `Bearer ${this.openAiApiKey}`,
      "Content-Type": "application/json",
      ...additionalHeaders,
    };
  }
}
