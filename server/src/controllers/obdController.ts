import type { Request, Response } from "express";
import { getMockScan } from "../services/obd/mockObdService.js";

export function getMockObdScan(_req: Request, res: Response) {
  const scan = getMockScan();
  res.json(scan);
}
