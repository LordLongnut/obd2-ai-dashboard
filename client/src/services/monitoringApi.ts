import { api } from "./api";
import type { ObdScan } from "../types/obd";

export type MonitoringAlert = {
  id: string;
  createdAt: string;
  severity: "Info" | "Low" | "Medium" | "High";
  title: string;
  message: string;
  pid?: string;
};

export type MonitoringStatus = {
  isRunning: boolean;
  sessionId: string | null;
  startedAt: string | null;
  stoppedAt: string | null;
  intervalMs: number;
  samplesCollected: number;
  lastSampleAt: string | null;
  lastError: string | null;
  latestSnapshot: ObdScan | null;
  activeAlerts: MonitoringAlert[];
};

export type MonitoringSample = {
  id: string;
  sessionId: string;
  createdAt: string;
  scan: ObdScan;
  alerts: MonitoringAlert[];
};

export async function startMonitoring(intervalSeconds = 5) {
  const response = await api.post<MonitoringStatus>("/monitoring/start", {
    intervalSeconds
  });

  return response.data;
}

export async function stopMonitoring() {
  const response = await api.post<MonitoringStatus>("/monitoring/stop");
  return response.data;
}

export async function fetchMonitoringStatus() {
  const response = await api.get<MonitoringStatus>("/monitoring/status");
  return response.data;
}

export async function fetchMonitoringSamples(limit = 25) {
  const response = await api.get<MonitoringSample[]>(
    `/monitoring/samples?limit=${limit}`
  );

  return response.data;
}
