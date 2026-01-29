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
        }
        catch (error) {
            console.log("Error in authenticated request:", error.message);
            // Attempt logout even on error
            try {
                await this.logOut();
            }
            catch (logoutError) {
                console.log("Logout failed after error:", logoutError.message);
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
    async deleteTokenFile() {
        try {
            await promises_1.default.unlink(TOKEN_FILE_PATH);
        }
        catch (error) {
            if (error.code !== "ENOENT") {
                console.error("Failed to delete token file:", error);
            }
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
    async logOut() {
        try {
            const token = await this.getToken();
            if (!token) {
                throw new Error("Failed to authenticate with Fishbowl");
            }
            const response = await axios_1.default.post(`${environment_1.config.fishbowl.baseUrl}/logout`, null, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                timeout: 10000,
            });
            this.token = null;
            this.tokenPromise = null;
            this.deleteTokenFile();
            return response;
        }
        catch (error) {
            console.log(`Error logging out: ${error.message} `);
            throw error;
        }
    }
    async seeTable(partNumber) {
        return await this.makeAuthenticatedRequest(async () => {
            const token = await this.getToken();
            if (!token) {
                throw new Error("Failed to authenticate with Fishbowl");
            }
            const response = await axios_1.default.get(`${environment_1.config.fishbowl.baseUrl}/data-query`, {
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
            });
            return response.data;
        });
    }
    async getAllActivePartNums() {
        return await this.makeAuthenticatedRequest(async () => {
            const token = await this.getToken();
            if (!token) {
                throw new Error("Failed to authenticate with Fishbowl");
            }
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
        });
    }
    async getAllPartNumsWithDescription() {
        return await this.makeAuthenticatedRequest(async () => {
            const token = await this.getToken();
            if (!token) {
                throw new Error("Failed to authenticate with Fishbowl");
            }
            const response = await axios_1.default.get(`${environment_1.config.fishbowl.baseUrl}/data-query`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                timeout: 10000,
                params: {
                    query: `SELECT part.num as "PartNum", part.description as 'Description', part.details as 'Details' FROM part`,
                },
            });
            // // Save data locally
            // const dataPath = path.join(__dirname, "../../data/parts.json");
            // try {
            //   await fs.writeFile(dataPath, JSON.stringify(response.data, null, 2), "utf-8");
            //   console.log("Parts data saved to file");
            // } catch (error) {
            //   console.error("Failed to save parts data to file:", error);
            // }
            return response.data.map((obj) => ({
                PartNum: obj.PartNum,
                Description: obj.Description,
                Details: obj.Details,
            }));
        });
    }
}
exports.FishbowlService = FishbowlService;
FishbowlService.instance = null;
exports.fishbowlService = FishbowlService.getInstance();
//# sourceMappingURL=fishbowl.service.js.map