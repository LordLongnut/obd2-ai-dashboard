import { api } from "./api";
import type { ObdScan } from "../types/obd";

export async function fetchMockObdScan(): Promise<ObdScan> {
  const response = await api.get<ObdScan>("/obd/mock-scan");
  return response.data;
}

export async function fetchLiveObdSnapshot(): Promise<ObdScan> {
  const response = await api.get<ObdScan>("/obd/snapshot");
  return response.data;
}