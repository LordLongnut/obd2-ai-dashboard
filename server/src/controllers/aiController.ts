import type { Request, Response } from "express";
import { getMockDiagnosis } from "../services/ai/mockAiService.js";

export function diagnoseScan(req: Request, res: Response) {
  const scan = req.body;
  const diagnosis = getMockDiagnosis(scan);

  res.json(diagnosis);
}
