import type { Request, Response } from "express";
import {
  createScanRecord,
  getScanRecordById,
  getScanRecords
} from "../services/scan/scanHistoryService.js";

export async function saveScanRecord(req: Request, res: Response) {
  try {
    const { scan, diagnosis, symptoms, scanSource } = req.body;

    if (!scan || !diagnosis) {
      res.status(400).json({
        message: "scan and diagnosis are required"
      });
      return;
    }

    const record = await createScanRecord({
      scan,
      diagnosis,
      symptoms,
      scanSource
    });

    res.status(201).json(record);
  } catch (error) {
    console.error("Save scan failed:", error);

    res.status(500).json({
      message: "Failed to save scan record",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}

export async function listScanRecords(_req: Request, res: Response) {
  try {
    const records = await getScanRecords();
    res.json(records);
  } catch (error) {
    console.error("List scans failed:", error);

    res.status(500).json({
      message: "Failed to list scan records",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}

export async function getScanRecord(req: Request, res: Response) {
  try {
    const record = await getScanRecordById(req.params.id);

    if (!record) {
      res.status(404).json({ message: "Scan record not found" });
      return;
    }

    res.json(record);
  } catch (error) {
    console.error("Get scan failed:", error);

    res.status(500).json({
      message: "Failed to get scan record",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
