import axios from "axios";
import { config } from "../config/environment";
import fs from "fs/promises";
import path from "path";

const TOKEN_FILE_PATH = path.join(__dirname, "../../.fishbowl-token");

export class FishbowlService {
  private token: string | null = null;
  private tokenPromise: Promise<string | null> | null = null;

  async getToken(): Promise<string | null> {
    if (this.token) {
      return this.token;
    }

    if (!this.tokenPromise) {
      this.tokenPromise = this.loadOrCreateToken();
    }

    this.token = await this.tokenPromise;
    return this.token;
  }

  private async loadOrCreateToken(): Promise<string | null> {
    const savedToken = await this.loadTokenFromFile();

    if (savedToken) {
      const isValid = await this.validateToken(savedToken);

      if (isValid) {
        console.log("Using saved token from previous session");
        this.token = savedToken;
        return savedToken;
      } else {
        console.log("Saved token is invalid, logging in again");
      }
    }

    const newToken = await this.login();
    if (newToken) {
      await this.saveTokenToFile(newToken);
    }

    return newToken;
  }

  private async loadTokenFromFile(): Promise<string | null> {
    try {
      const token = await fs.readFile(TOKEN_FILE_PATH, "utf-8");
      return token.trim();
    } catch (error) {
      return null;
    }
  }

  private async saveTokenToFile(token: string): Promise<void> {
    try {
      await fs.writeFile(TOKEN_FILE_PATH, token, "utf-8");
      console.log("Token saved to file");
    } catch (error) {
      console.error("Failed to save token to file:", error);
    }
  }

  private async validateToken(token: string): Promise<boolean> {
    try {
      await axios.get(
        // change to pagesize =1 later
        `${config.fishbowl.baseUrl}/parts/inventory`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          timeout: 5000,
        }
      );
      return true;
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        return false;
      }
      return true;
    }
  }

  private async login(): Promise<string | null> {
    console.log("Logging in to Fishbowl...");
    try {
      const response = await axios.post(
        `${config.fishbowl.baseUrl}/login`,
        {
          appName: config.fishbowl.appName,
          appDescription: config.fishbowl.appDescription,
          appId: config.fishbowl.appId,
          username: config.fishbowl.username,
          password: config.fishbowl.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Login successful");
      if (response.data?.token) {
        return response.data.token;
      } else {
        console.error("No token received");
        return null;
      }
    } catch (error: any) {
      console.error("Login failed:", error.response?.data || error.message);
      return null;
    }
  }

  async getInventory() {
    const token = await this.getToken();

    if (!token) {
      throw new Error("Failed to authenticate with Fishbowl");
    }

    try {
      const response = await axios.get(
        `${config.fishbowl.baseUrl}/parts/inventory`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000,
        }
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "Error fetching inventory:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async seeTable() {
    const token = await this.getToken();

    if (!token) {
      throw new Error("Failed to authenticate with Fishbowl");
    }

    try {
      const response = await axios.get(
        `${config.fishbowl.baseUrl}/data-query`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000,
          params: {
            query: `SELECT 
    part.num AS "Part Number",
    trackingtext.info AS "Condition",
    tag.qty AS "Qty"
FROM tag
LEFT JOIN part 
    ON tag.partid = part.id
LEFT JOIN trackingtext 
    ON tag.id = trackingtext.tagid
WHERE tag.typeid = 30 and trackingtext.info not like 'RWI%';
`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "Error fetching table:",
        error.response?.data || error.message
      );
      throw error;
    }
  }
}
