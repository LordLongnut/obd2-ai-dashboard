import type { Request, Response } from "express";
import { getRealAiDiagnosis } from "../services/ai/aiDiagnosisService.js";
import { getMockDiagnosis } from "../services/ai/mockAiService.js";

export async function diagnoseScan(req: Request, res: Response) {
  const scan = req.body;

  try {
    const diagnosis = await getRealAiDiagnosis(scan);
    res.json({
      ...diagnosis,
      source: "real-ai"
    });
  } catch (error) {
    console.error("Real AI diagnosis failed. Falling back to mock diagnosis.");
    console.error(error);

    const fallbackDiagnosis = getMockDiagnosis(scan);

    res.json({
      ...fallbackDiagnosis,
      source: "mock-fallback",
      warning:
        "Real AI diagnosis is unavailable because the API quota or billing is not active. Showing mock fallback diagnosis."
    });
  }
}
