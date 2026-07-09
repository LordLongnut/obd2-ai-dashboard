import { Router } from "express";
import {
  readIgnitionWatchStatus,
  startIgnitionWatchController,
  stopIgnitionWatchController
} from "../controllers/ignitionController.js";

const router = Router();

router.post("/watch/start", startIgnitionWatchController);
router.post("/watch/stop", stopIgnitionWatchController);
router.get("/watch/status", readIgnitionWatchStatus);

export default router;
