"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fishbowl_service_1 = require("../services/fishbowl.service");
const router = (0, express_1.Router)();
const fishbowlService = fishbowl_service_1.FishbowlService.getInstance();
router.get("/activeparts", async (req, res) => {
    console.log("Fetching active parts list");
    try {
        const data = await fishbowlService.getAllActivePartNums();
        res.json({
            success: true,
            data: data,
        });
    }
    catch (error) {
        console.error("Fishbowl inventory error:", error.response?.data || error.message);
        res.status(500).json({
            success: false,
            error: error.response?.data?.message || error.message,
        });
    }
});
router.get("/test-token", async (req, res) => {
    try {
        const token = await fishbowlService.getToken();
        console.log("Token:", token);
        res.json({
            success: true,
            token: token,
            message: "Token retrieved successfully",
        });
    }
    catch (error) {
        console.error("Token retrieval error:", error.message);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});
router.get("/seetable", async (req, res) => {
    try {
        const table = await fishbowlService.seeTable(req.query.partNumber);
        console.log("Table:", table);
        res.json({
            success: true,
            table: table,
            message: "Table retrieved successfully",
        });
    }
    catch (error) {
        console.error("Table retrieval error:", error.message);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});
exports.default = router;
//# sourceMappingURL=fishbowl.routes.js.map