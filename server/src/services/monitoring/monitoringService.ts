import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

import type { ObdScan } from "../../types/obd.js";
import { getLiveObdScan as getLiveObdSnapshot } from "../obd/liveObdService.js";

type AlertSeverity = "Info" | "Low" | "Medium" | "High";

export type MonitoringAlert = {
  id: string;
  createdAt: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  pid?: string;
};

export type MonitoringSample = {
  id: string;
  sessionId: string;
  createdAt: string;
  scan: ObdScan;
  alerts: MonitoringAlert[];
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

const storageDir = path.resolve(process.cwd(), "storage");
const samplesFile = path.join(storageDir, "monitoring-samples.json");

let timer: ReturnType<typeof setInterval> | null = null;
let isPolling = false;
let previousSnapshot: ObdScan | null = null;

let monitoringStatus: MonitoringStatus = {
  isRunning: false,
  sessionId: null,
  startedAt: null,
  stoppedAt: null,
  intervalMs: 5000,
  samplesCollected: 0,
  lastSampleAt: null,
  lastError: null,
  latestSnapshot: null,
  activeAlerts: []
};

async function ensureStorageFile() {
  await fs.mkdir(storageDir, { recursive: true });

  try {
    await fs.access(samplesFile);
  } catch {
    await fs.writeFile(samplesFile, "[]", "utf8");
  }
}

async function readSamples(): Promise<MonitoringSample[]> {
  await ensureStorageFile();

  const raw = await fs.readFile(samplesFile, "utf8");
  return JSON.parse(raw) as MonitoringSample[];
}

async function writeSamples(samples: MonitoringSample[]) {
  await ensureStorageFile();
  await fs.writeFile(samplesFile, JSON.stringify(samples, null, 2), "utf8");
}

async function saveSample(sample: MonitoringSample) {
  const samples = await readSamples();

  samples.unshift(sample);

  // Keep this prototype file from growing forever.
  const cappedSamples = samples.slice(0, 1000);

  await writeSamples(cappedSamples);
}

function createAlert(
  severity: AlertSeverity,
  title: string,
  message: string,
  pid?: string
): MonitoringAlert {
  return {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    severity,
    title,
    message,
    pid
  };
}

function analyzeSnapshot(
  current: ObdScan,
  previous: ObdScan | null
): MonitoringAlert[] {
  const alerts: MonitoringAlert[] = [];
  const live = current.liveData;

  if (current.troubleCodes.length > 0) {
    alerts.push(
      createAlert(
        "Medium",
        "Diagnostic trouble codes present",
        `${current.troubleCodes.length} code(s) are currently reported by the vehicle.`,
        "DTC"
      )
    );
  }

  if (current.monitorStatus?.milOn) {
    alerts.push(
      createAlert(
        "Medium",
        "MIL is commanded on",
        "The vehicle is reporting that the malfunction indicator lamp is commanded on.",
        "0101"
      )
    );
  }

  if (live.coolantTempF >= 230) {
    alerts.push(
      createAlert(
        "High",
        "Coolant temperature high",
        `Coolant temperature is ${live.coolantTempF}°F.`,
        "0105"
      )
    );
  } else if (live.coolantTempF >= 220) {
    alerts.push(
      createAlert(
        "Medium",
        "Coolant temperature elevated",
        `Coolant temperature is ${live.coolantTempF}°F.`,
        "0105"
      )
    );
  }

  if (Math.abs(live.longTermFuelTrimBank1Percent) >= 15) {
    alerts.push(
      createAlert(
        "Medium",
        "Long-term fuel trim out of range",
        `LTFT Bank 1 is ${live.longTermFuelTrimBank1Percent}%. This can indicate a developing air/fuel issue.`,
        "0107"
      )
    );
  }

  const combinedFuelTrim =
    live.shortTermFuelTrimBank1Percent + live.longTermFuelTrimBank1Percent;

  if (Math.abs(combinedFuelTrim) >= 25) {
    alerts.push(
      createAlert(
        "High",
        "Combined fuel trim excessive",
        `STFT + LTFT Bank 1 is ${combinedFuelTrim.toFixed(
          1
        )}%. This is a strong air/fuel correction signal.`,
        "0106/0107"
      )
    );
  }

  if (
    typeof live.controlModuleVoltage === "number" &&
    live.rpm > 500 &&
    live.controlModuleVoltage < 13
  ) {
    alerts.push(
      createAlert(
        "Medium",
        "Charging voltage low while running",
        `Control module voltage is ${live.controlModuleVoltage}V while engine RPM is ${live.rpm}.`,
        "0142"
      )
    );
  }

  if (
    previous &&
    live.coolantTempF - previous.liveData.coolantTempF >= 15
  ) {
    alerts.push(
      createAlert(
        "Low",
        "Coolant temperature rising quickly",
        `Coolant temperature rose from ${previous.liveData.coolantTempF}°F to ${live.coolantTempF}°F between samples.`,
        "0105"
      )
    );
  }

  return alerts;
}

async function pollOnce() {
  if (!monitoringStatus.isRunning || !monitoringStatus.sessionId) return;
  if (isPolling) return;

  isPolling = true;

  try {
    const scan = await getLiveObdSnapshot();
    const alerts = analyzeSnapshot(scan, previousSnapshot);

    previousSnapshot = scan;

    const sample: MonitoringSample = {
      id: randomUUID(),
      sessionId: monitoringStatus.sessionId,
      createdAt: new Date().toISOString(),
      scan,
      alerts
    };

    await saveSample(sample);

    monitoringStatus = {
      ...monitoringStatus,
      samplesCollected: monitoringStatus.samplesCollected + 1,
      lastSampleAt: sample.createdAt,
      lastError: null,
      latestSnapshot: scan,
      activeAlerts: alerts
    };
  } catch (error) {
    monitoringStatus = {
      ...monitoringStatus,
      lastError: error instanceof Error ? error.message : "Unknown polling error"
    };
  } finally {
    isPolling = false;
  }
}

export async function startMonitoring(intervalSeconds = 5) {
  if (monitoringStatus.isRunning) {
    return monitoringStatus;
  }

  const intervalMs = Math.max(2000, Math.min(intervalSeconds * 1000, 60000));

  previousSnapshot = null;

  monitoringStatus = {
    isRunning: true,
    sessionId: randomUUID(),
    startedAt: new Date().toISOString(),
    stoppedAt: null,
    intervalMs,
    samplesCollected: 0,
    lastSampleAt: null,
    lastError: null,
    latestSnapshot: null,
    activeAlerts: []
  };

  void pollOnce();

  timer = setInterval(() => {
    void pollOnce();
  }, intervalMs);

  return monitoringStatus;
}

export async function stopMonitoring() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }

  monitoringStatus = {
    ...monitoringStatus,
    isRunning: false,
    stoppedAt: new Date().toISOString()
  };

  return monitoringStatus;
}

export function getMonitoringStatus() {
  return monitoringStatus;
}

export async function getMonitoringSamples(limit = 50) {
  const samples = await readSamples();
  return samples.slice(0, limit);
}
