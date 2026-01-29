import { Router } from "express";
import { msGraphService } from "../services/msgraph.service";
import { runEmailPipeline } from "../pipelines/emailpipeline";
import { config } from "../config/environment";
import { ref } from "process";

const router = Router();

const userEmail = config.graph.userEmail;

router.get("/getmail", async (req, res) => {
  try {
    const response = await msGraphService.getMail();
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

router.post("/sendmail", async (req, res) => {
  try {

    if (!req.body.subject || !req.body.body) {
      console.error(' Email is missing subject or body ', 400)
      throw Error('Email is missing subject or body body')
    }
    const response = await msGraphService.sendEmail('support@renewedwarehouse.com', req.body.subject, req.body.body);
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

router.delete("/webhook/refresh", async (req, res) => {
  try {
    const response = await msGraphService.refreshSubscription();
    res.json(response);
  } catch (err: any) {
    console.error("Webhook refresh error:", err);
    res.status(500).json({ error: `Failed to refresh ${err}` });
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
    console.log("webhook notif");
    const { value } = req.body;

    if (!value || !Array.isArray(value) || value.length === 0) {
      console.log("Invalid webhook payload:", req.body);
      return res.status(400).json({ error: "Invalid payload" });
    }

    if (!value[0] || value[0].clientState !== config.webhooks.clientState) {
      console.error("Recieved webhook notification with invalid client state");
      return res.status(401).json({ error: "Invalid client state" });
    }

    res.status(202).json({ message: "Notification received" });

    const messageId = value[0].resource?.split("/Messages/")[1];
    const client = await msGraphService.getClient();
    if (messageId) {
      client
        .api(`/users/${userEmail}/messages/${messageId}`)
        .select("from")
        .get()
        .then((msg: any) => {
          const sender = msg.from?.emailAddress?.address;
          if (sender && sender.toLowerCase() === userEmail.toLowerCase()) {
            console.log("Ignoring message from self:", messageId);
            return;
          }
          runEmailPipeline(messageId).catch((err) => {
            console.error("Failed to process email:", err);
          });
        })
        .catch((err) => {
          console.error("Failed to check message sender:", err.message);
        });
    }
  } catch (error: any) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Failed to process webhook" });
  }
});

export default router;
