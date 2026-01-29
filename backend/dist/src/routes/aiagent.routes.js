"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const main_1 = require("../agent/main");
const router = (0, express_1.Router)();
router.post("/input", async (req, res) => {
    const input = req.body.input;
    try {
        const workflowres = await (0, main_1.runWorkflow)({ input_as_text: input });
        res.json({ agentResponse: workflowres });
    }
    catch (error) {
        console.error("AI Agent error:", error);
        const status = error.status || 500;
        const message = {
            message: error.message ||
                "Something went wrong with getting the Ai Agent response",
        };
        res.status(status).json(message);
    }
});
exports.default = router;
//# sourceMappingURL=aiagent.routes.js.map