"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fishbowlService = exports.FishbowlService = void 0;
const axios_1 = __importDefault(require("axios"));
const environment_1 = require("../config/environment");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const TOKEN_FILE_PATH = path_1.default.join(__dirname, "../../.fishbowl-token");
class FishbowlService {
    constructor() {
        this.token = null;
        this.tokenPromise = null;
    }
    static getInstance() {
        if (!FishbowlService.instance) {
            FishbowlService.instance = new FishbowlService();
        }
        return FishbowlService.instance;
    }
    async getToken() {
        if (this.token) {
            return this.token;
        }
        if (!this.tokenPromise) {
            this.tokenPromise = this.loadOrCreateToken();
        }
        this.token = await this.tokenPromise;
        return this.token;
    }
    expireToken() {
        if (this.token) {
            this.token = this.token.slice(0, -5) + "XXXXX";
            console.log("Token corrupted for testing");
        }
    }
    async makeAuthenticatedRequest(requestFn) {
        try {
            return await requestFn();
        }
        catch (error) {
            if (error.response?.status === 401 || error.response?.status === 403) {
                console.log("make auth request 1");
                this.token = null;
                this.tokenPromise = null;
                await this.getToken();
                return await requestFn();
            }
            throw error;
        }
    }
    async loadOrCreateToken() {
        const savedToken = await this.loadTokenFromFile();
        console.log("loading or creating token");
        if (savedToken) {
            const isValid = await this.validateToken(savedToken);
            if (isValid) {
                console.log("Using saved token from previous session");
                this.token = savedToken;
                return savedToken;
            }
            else {
                console.log("Saved token is invalid, logging in again");
            }
        }
        const newToken = await this.login();
        if (newToken) {
            await this.saveTokenToFile(newToken);
        }
        return newToken;
    }
    async loadTokenFromFile() {
        try {
            const token = await promises_1.default.readFile(TOKEN_FILE_PATH, "utf-8");
            return token.trim();
        }
        catch (error) {
            return null;
        }
    }
    async saveTokenToFile(token) {
        try {
            await promises_1.default.writeFile(TOKEN_FILE_PATH, token, "utf-8");
            console.log("Token saved to file");
        }
        catch (error) {
            console.error("Failed to save token to file:", error);
        }
    }
    async validateToken(token) {
        try {
            await axios_1.default.get(
            // change to pagesize =1 later
            `${environment_1.config.fishbowl.baseUrl}/parts/inventory`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                timeout: 5000,
            });
            return true;
        }
        catch (error) {
            if (error.response?.status === 401 || error.response?.status === 403) {
                return false;
            }
            return true;
        }
    }
    async login() {
        console.log("Logging in to Fishbowl...");
        try {
            const response = await axios_1.default.post(`${environment_1.config.fishbowl.baseUrl}/login`, {
                appName: environment_1.config.fishbowl.appName,
                appDescription: environment_1.config.fishbowl.appDescription,
                appId: environment_1.config.fishbowl.appId,
                username: environment_1.config.fishbowl.username,
                password: environment_1.config.fishbowl.password,
            }, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            console.log("Login successful");
            if (response.data?.token) {
                return response.data.token;
            }
            else {
                console.error("No token received");
                return null;
            }
        }
        catch (error) {
            console.error("Login failed:", error.response?.data || error.message);
            return null;
        }
    }
    // async getInventory() {
    //   const token = await this.getToken();
    //   if (!token) {
    //     throw new Error("Failed to authenticate with Fishbowl");
    //   }
    //   try {
    //     const response = await axios.get(
    //       `${config.fishbowl.baseUrl}/parts/inventory`,
    //       {
    //         headers: {
    //           "Content-Type": "application/json",
    //           Authorization: `Bearer ${token}`,
    //         },
    //         timeout: 10000,
    //       }
    //     );
    //     return response.data;
    //   } catch (error: any) {
    //     console.error(
    //       "Error fetching inventory:",
    //       error.response?.data || error.message
    //     );
    //     throw error;
    //   }
    // }
    async seeTable(partNumber) {
        return await this.makeAuthenticatedRequest(async () => {
            const token = await this.getToken();
            if (!token) {
                throw new Error("Failed to authenticate with Fishbowl");
            }
            try {
                const response = await axios_1.default.get(`${environment_1.config.fishbowl.baseUrl}/data-query`, {
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
  INNER JOIN product
      ON part.num = product.sku AND product.activeflag = true
  WHERE tag.typeid = 30 and trackingtext.info not like 'TX%' and trackingtext.info like 'RWI11' and part.num = '${partNumber}';
  `,
                    },
                });
                return response.data;
            }
            catch (error) {
                console.error("Error fetching table:", error.response?.data || error.message);
                throw error;
            }
        });
    }
    async getAllActivePartNums() {
        return await this.makeAuthenticatedRequest(async () => {
            const token = await this.getToken();
            if (!token) {
                throw new Error("Failed to authenticate with Fishbowl");
            }
            try {
                const response = await axios_1.default.get(`${environment_1.config.fishbowl.baseUrl}/data-query`, {
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
                });
                const stringlist = response.data.map((obj) => obj["Part Number"]);
                return stringlist;
            }
            catch (error) {
                console.error("Error in getting active parts:", error.response?.data || error.message);
                throw error;
            }
        });
    }
}
exports.FishbowlService = FishbowlService;
FishbowlService.instance = null;
exports.fishbowlService = FishbowlService.getInstance();
//# sourceMappingURL=fishbowl.service.js.map