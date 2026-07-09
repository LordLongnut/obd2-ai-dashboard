import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    message: "Alerts endpoint working",
    alerts: [],
  });
});

export default router;
