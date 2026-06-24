import { Router } from "express";
import {
  getMockObdScan,
  getObdAdapterStatus
} from "../controllers/obdController.js";

const router = Router();

router.get("/mock-scan", getMockObdScan);
router.get("/adapter-status", getObdAdapterStatus);

export default router;
