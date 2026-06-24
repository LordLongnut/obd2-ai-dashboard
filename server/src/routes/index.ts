import { Router } from "express";
import obdRoutes from "./obdRoutes.js";
import aiRoutes from "./aiRoutes.js";

const router = Router();

router.use("/obd", obdRoutes);
router.use("/ai", aiRoutes);

export default router;
