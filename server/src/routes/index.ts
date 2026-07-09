import { Router } from "express";
import aiRoutes from "./aiRoutes.js";
import obdRoutes from "./obdRoutes.js";
import scanRoutes from "./scanRoutes.js";
import monitoringRoutes from "./monitoringRoutes.js";
import ignitionRoutes from "./ignitionRoutes.js";

const router = Router();

router.use("/obd", obdRoutes);
router.use("/ai", aiRoutes);
router.use("/scans", scanRoutes);
router.use("/monitoring", monitoringRoutes);
router.use("/ignition", ignitionRoutes);

export default router;
