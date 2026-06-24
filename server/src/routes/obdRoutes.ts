import { Router } from "express";
import { getMockObdScan } from "../controllers/obdController.js";

const router = Router();

router.get("/mock-scan", getMockObdScan);

export default router;
