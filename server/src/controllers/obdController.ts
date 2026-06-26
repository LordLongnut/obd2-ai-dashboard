import type { Request, Response } from "express";
import { getMockScan } from "../services/obd/mockObdService.js";
import { getLiveObdScan } from "../services/obd/liveObdService.js";
import { getAdapterMode } from "../services/obd/obdAdapterService.js";

export function getMockObdScan(_req: Request, res: Response) {
  const scan = getMockScan();
  res.json(scan);
}

export async function getLiveObdSnapshot(_req: Request, res: Response) {
  try {
    const scan = await getLiveObdScan();
    res.json(scan);
  } catch (error) {
    console.error("Live OBD snapshot failed:", error);

    res.status(500).json({
      message: "Live OBD snapshot failed",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}

export function getObdAdapterStatus(_req: Request, res: Response) {
  res.json(getAdapterMode());
}
