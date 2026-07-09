import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    message: "Sessions endpoint working",
    sessions: [],
  });
});

router.get("/:sessionId", (req, res) => {
  res.json({
    message: "Single session endpoint working",
    sessionId: req.params.sessionId,
  });
});

export default router;
