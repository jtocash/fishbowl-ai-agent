"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get("/test", (req, res) => {
    res.set("X-Debug", "cors-active");
    res.json({ ok: true });
});
router.get("/health", (req, res) => {
    res.json({ message: "Backend API is running!" });
});
exports.default = router;
//# sourceMappingURL=health.routes.js.map