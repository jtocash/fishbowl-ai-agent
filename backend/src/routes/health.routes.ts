import { Router } from "express";

const router = Router();

router.get("/test", (req, res) => {
  res.set("X-Debug", "cors-active");
  res.json({ ok: true });
});

router.get("/health", (req, res) => {
  res.json({ message: "Backend API is running!" });
});

export default router;
