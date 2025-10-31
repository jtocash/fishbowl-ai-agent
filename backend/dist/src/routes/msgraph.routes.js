"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const msgraph_service_1 = require("../services/msgraph.service");
const emailpipeline_1 = require("../pipelines/emailpipeline");
const environment_1 = require("../config/environment");
const router = (0, express_1.Router)();
const userEmail = environment_1.config.graph.userEmail;
router.get("/getmail", async (req, res) => {
    try {
        const response = await (0, msgraph_service_1.getMail)();
        res.json(response);
    }
    catch (err) {
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
        console.log("webhook notif");
        const { value } = req.body;
        if (value[0].clientState !== environment_1.config.webhooks.clientState) {
            console.error("Recieved webhook notification with invalid client state");
            return res.status(401).json({ error: "Invalid client state" });
        }
        res.status(202).json({ message: "Notification received" });
        if (value && value.length > 0) {
            const messageId = value[0].resource?.split("/Messages/")[1];
            if (messageId) {
                msgraph_service_1.graphClient
                    .api(`/users/${userEmail}/messages/${messageId}`)
                    .select("from")
                    .get()
                    .then((msg) => {
                    const sender = msg.from?.emailAddress?.address;
                    if (sender && sender.toLowerCase() === userEmail.toLowerCase()) {
                        console.log("Ignoring message from self:", messageId);
                        return;
                    }
                    (0, emailpipeline_1.runEmailPipeline)(messageId).catch((err) => {
                        console.error("Failed to process email:", err);
                    });
                })
                    .catch((err) => {
                    console.error("Failed to check message sender:", err.message);
                });
            }
        }
    }
    catch (error) {
        console.error("Webhook error:", error);
        res.status(500).json({ error: "Failed to process webhook" });
    }
});
exports.default = router;
//# sourceMappingURL=msgraph.routes.js.map