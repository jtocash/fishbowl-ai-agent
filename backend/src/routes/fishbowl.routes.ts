import { Router } from "express";
import { FishbowlService } from "../services/fishbowl.service";

const router = Router();
const fishbowlService = new FishbowlService();

router.get("/inventory", async (req, res) => {
  console.log("Fetching inventory list");

  try {
    const data = await fishbowlService.getInventory();
    console.log("Fishbowl inventory response:", data);
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

export default router;
