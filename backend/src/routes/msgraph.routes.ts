import { Router } from "express";
import { graphTest } from "../services/msgraphapi.service";

const router = Router();

router.get("/getmail", async (req, res) => {
  try {
    console.log("here");
    const response = await graphTest();
    res.json(response);
  } catch (error: any) {
    console.error("Microsoft Graph error:", error.response?.data || error);
    const statusCode = error.response?.status || 500;
    res.status(statusCode).json({
      error: error.message,
      details: error.response?.data,
    });
  }
});

export default router;
