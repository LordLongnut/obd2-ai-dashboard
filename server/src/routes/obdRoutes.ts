import { Router } from "express";
import {
  getMockObdScan,
  getLiveObdSnapshot,
  getObdAdapterStatus
} from "../controllers/obdController.js";

const router = Router();

router.get("/mock-scan", getMockObdScan);
router.get("/snapshot", getLiveObdSnapshot);
router.get("/adapter-status", getObdAdapterStatus);

export default router;
