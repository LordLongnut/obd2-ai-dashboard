import { api } from "./api";
import type { AiDiagnosis, ObdScan } from "../types/obd";

export type ScanSource = "simulated" | "live" | null;

export type SavedScanRecord = {
  id: string;
  createdAt: string;
  scanSource: ScanSource;
  symptoms: string;
  scan: ObdScan;
  diagnosis: AiDiagnosis;
};

export type CreateScanRecordInput = {
  scanSource: ScanSource;
  symptoms: string;
  scan: ObdScan;
  diagnosis: AiDiagnosis;
};

export async function saveScanRecord(
  input: CreateScanRecordInput
): Promise<SavedScanRecord> {
  const response = await api.post<SavedScanRecord>("/scans", input);
  return response.data;
}

export async function fetchScanHistory(): Promise<SavedScanRecord[]> {
  const response = await api.get<SavedScanRecord[]>("/scans");
  return response.data;
}
