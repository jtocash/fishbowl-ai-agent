import { Router } from "express";
import { FishbowlService } from "../services/fishbowl.service";

const router = Router();
const fishbowlService = FishbowlService.getInstance();

router.get("/activeparts", async (req, res) => {
  console.log("Fetching active parts list");

  try {
    const data = await fishbowlService.getAllActivePartNums();
    res.json({
      success: true,
      data: data,
    });
  } catch (error: any) {
    console.error(
      "Fishbowl inventory error:",
      error.response?.data || error.message
    );
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
  } catch (error: any) {
    console.error("Token retrieval error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get("/seetable", async (req, res) => {
  try {
    const table = await fishbowlService.seeTable(
      req.query.partNumber as string
    );
    console.log("Table:", table);
    res.json({
      success: true,
      table: table,
      message: "Table retrieved successfully",
    });
  } catch (error: any) {
    console.error("Table retrieval error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
