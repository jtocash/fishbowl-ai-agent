import axios from "axios";
import { config } from "../config/environment";
import fs from "fs/promises";
import path from "path";
import { InventoryTable } from "../types/fishbowl.types";

const TOKEN_FILE_PATH = path.join(__dirname, "../../.fishbowl-token");

export class FishbowlService {
  private static instance: FishbowlService | null = null;
  private token: string | null = null;
  private tokenPromise: Promise<string | null> | null = null;

  private constructor() {}

  static getInstance(): FishbowlService {
    if (!FishbowlService.instance) {
      FishbowlService.instance = new FishbowlService();
    }
    return FishbowlService.instance;
  }

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

  public expireToken(): void {
    if (this.token) {
      this.token = this.token.slice(0, -5) + "XXXXX";
      console.log("Token corrupted for testing");
    }
  }

  private async makeAuthenticatedRequest<T>(
    requestFn: () => Promise<T>
  ): Promise<T> {
    try {
      // Login every time
      this.token = null;
      this.tokenPromise = null;
      const token = await this.login();
      if (token) {
        this.token = token;
      }
      
      const result = await requestFn();
      
      // Logout when finished
      await this.logOut();
      
      return result;
    } catch (error: any) {
      console.log("Error in authenticated request:", error.message);
      // Attempt logout even on error
      try {
        await this.logOut();
      } catch (logoutError: any) {
        console.log("Logout failed after error:", logoutError.message);
      }
      throw error;
    }
  }

  private async loadOrCreateToken(): Promise<string | null> {
    const savedToken = await this.loadTokenFromFile();
    console.log("loading or creating token");

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

  private async deleteTokenFile(): Promise<void> {
    try {
      await fs.unlink(TOKEN_FILE_PATH);
    } catch (error: any) {
      if (error.code !== "ENOENT") {
        console.error("Failed to delete token file:", error);
      }
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

  public async login(): Promise<string | null> {
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

  async logOut() {
    try {
      const token = await this.getToken();

      if (!token) {
        throw new Error("Failed to authenticate with Fishbowl");
      }

      const response = await axios.post(
        `${config.fishbowl.baseUrl}/logout`,
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000,
        }
      );
      this.token = null;
      this.tokenPromise = null;
      this.deleteTokenFile();
      return response;
    } catch (error: any) {
      console.log(`Error logging out: ${error.message} `);
      throw error;
    }
  }

  async seeTable(partNumber: string): Promise<InventoryTable> {
    return await this.makeAuthenticatedRequest(async () => {
      const token = await this.getToken();

      if (!token) {
        throw new Error("Failed to authenticate with Fishbowl");
      }

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
    p.partid,
    p.num,
    p.sku,
    SUM(q.qtyonhand) - SUM(q.qtyallocatedso) AS AVAILABLE
FROM product p
INNER JOIN qtyinventory q
    ON p.partid = q.partid
WHERE q.locationgroupid != 1 and p.sku = '${partNumber}'
GROUP BY
    p.partid,
    p.num;

  `,
          },
        }
      );

      return response.data;
    });
  }

  async getAllActivePartNums(): Promise<string[]> {
    return await this.makeAuthenticatedRequest(async () => {
      const token = await this.getToken();

      if (!token) {
        throw new Error("Failed to authenticate with Fishbowl");
      }

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
      part.num AS "Part Number"
    FROM part
    INNER JOIN product
      ON part.num = product.sku AND product.activeflag = true
    `,
          },
        }
      );
      const stringlist = response.data.map((obj: any) => obj["Part Number"]);
      return stringlist;
    });
  }

  async getAllPartNumsWithDescription(): Promise<{ PartNum: string; Description: string; Details: string }[]> {
    return await this.makeAuthenticatedRequest(async () => {
      const token = await this.getToken();

      if (!token) {
        throw new Error("Failed to authenticate with Fishbowl");
      }

      const response = await axios.get(
        `${config.fishbowl.baseUrl}/data-query`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000,
          params: {
            query: `SELECT part.num as "PartNum", part.description as 'Description', part.details as 'Details' FROM part`,
          },
        }
      );
      
      // // Save data locally
      // const dataPath = path.join(__dirname, "../../data/parts.json");
      // try {
      //   await fs.writeFile(dataPath, JSON.stringify(response.data, null, 2), "utf-8");
      //   console.log("Parts data saved to file");
      // } catch (error) {
      //   console.error("Failed to save parts data to file:", error);
      // }
      
      return response.data.map((obj: any) => ({
        PartNum: obj.PartNum,
        Description: obj.Description,
        Details: obj.Details,
      }));
    });
  }
}

export const fishbowlService = FishbowlService.getInstance();
