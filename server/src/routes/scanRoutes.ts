import { Router } from "express";
import {
  getScanRecord,
  listScanRecords,
  saveScanRecord
} from "../controllers/scanController.js";

const router = Router();

router.post("/", saveScanRecord);
router.get("/", listScanRecords);
router.get("/:id", getScanRecord);

export default router;
