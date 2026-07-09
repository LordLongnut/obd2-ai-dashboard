import { Router } from "express";

const router = Router();

router.post("/sessions", (req, res) => {
  res.status(201).json({
    message: "Session ingest endpoint working",
    received: req.body,
  });
});

export default router;