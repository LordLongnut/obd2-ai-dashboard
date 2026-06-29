import { Router } from "express";
import {
  readMonitoringSamples,
  readMonitoringStatus,
  startMonitoringSession,
  stopMonitoringSession
} from "../controllers/monitoringController.js";

const router = Router();

router.post("/start", startMonitoringSession);
router.post("/stop", stopMonitoringSession);
router.get("/status", readMonitoringStatus);
router.get("/samples", readMonitoringSamples);

export default router;
