import { Router } from "express";
import { diagnoseScan } from "../controllers/aiController.js";

const router = Router();

router.post("/diagnose", diagnoseScan);

export default router;
