import { Router } from "express";
import { getMail } from "../services/msgraph.service";
import { runEmailPipeline } from "../pipelines/emailpipeline";
import { config } from "../config/environment";
import axios, { AxiosError } from "axios";

const router = Router();

router.get("/getmail", async (req, res) => {
  try {
    const response = await getMail();
    res.json(response);
  } catch (err: any) {
    console.error("Microsoft Graph error:", err.response?.data || err);

    const statusCode = err.response?.status || err.statusCode || 500;

    res.status(statusCode).json({
      error: err.message,
      details: err.response?.data?.details || {
        code: err.code,
        innerError: err.innerError?.message,
        statusCode: err.statusCode,
      },
    });
  }
});

router.all("/webhook", async (req, res) => {
  try {
    const validationToken = req.query.validationToken;

    if (validationToken) {
      console.log("Validation request received");
      res.status(200).send(validationToken);
      return;
    }

    console.log("Webhook notification received:", req.body);

    if (req.body.clientState !== config.webhooks.clientState) {
      console.error("Recieved webhook notification with invalid client state");
      return res.status(401).json({ error: "Invalid client state" });
    }

    const { value } = req.body;

    // Process email notifications
    if (value && value.length > 0) {
      const messageId = value[0].resource?.split("/Messages/")[1];
      if (messageId) {
        console.log("Processing email notification:", messageId);
        runEmailPipeline(messageId).catch((err) => {
          console.error("Failed to process email:", err);
        });
      }
    }

    // Return 202 Accepted to acknowledge receipt
    res.status(202).json({ message: "Notification received" });
  } catch (error: any) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Failed to process webhook" });
  }
});

export default router;
