import type { Request, Response } from "express";
import { getMockScan } from "../services/obd/mockObdService.js";
import { getAdapterMode } from "../services/obd/obdAdapterService.js";

export function getMockObdScan(_req: Request, res: Response) {
  const scan = getMockScan();
  res.json(scan);
}

export function getObdAdapterStatus(_req: Request, res: Response) {
  res.json(getAdapterMode());
}
