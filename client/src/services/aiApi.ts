import { api } from "./api";
import type { AiDiagnosis, ObdScan } from "../types/obd";

export async function requestAiDiagnosis(
  scan: ObdScan
): Promise<AiDiagnosis> {
  const response = await api.post<AiDiagnosis>("/ai/diagnose", scan);
  return response.data;
}
