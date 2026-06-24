import type { Request, Response } from "express";
import { getRealAiDiagnosis } from "../services/ai/aiDiagnosisService.js";

export async function diagnoseScan(req: Request, res: Response) {
  try {
    const scan = req.body;
    const diagnosis = await getRealAiDiagnosis(scan);

    res.json(diagnosis);
  } catch (error) {
    console.error("AI diagnosis failed:", error);

    res.status(500).json({
      message: "AI diagnosis failed",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
