import { SerialPort } from "serialport";

import {
  getMonitoringStatus,
  startMonitoring,
  stopMonitoring
} from "../monitoring/monitoringService.js";

type EngineState =
  | "unknown"
  | "ecu_awake"
  | "engine_running"
  | "post_run_logging"
  | "off";

type IgnitionWatchStatus = {
  isEnabled: boolean;
  isIgnitionOn: boolean;
  engineState: EngineState;
  engineHasRunThisSession: boolean;
  engineStoppedAt: string | null;
  postShutdownLoggingMs: number;
  postShutdownRemainingMs: number | null;
  probeIntervalMs: number;
  monitoringIntervalSeconds: number;
  startedAt: string | null;
  stoppedAt: string | null;
  lastProbeAt: string | null;
  lastSuccessfulProbeAt: string | null;
  lastError: string | null;
  consecutiveOnDetections: number;
  consecutiveOffDetections: number;
};

const OBD_PORT = process.env.OBD_PORT || "/dev/ttyUSB0";
const OBD_BAUD_RATE = Number(process.env.OBD_BAUD_RATE || 115200);

let timer: ReturnType<typeof setInterval> | null = null;
let isProbing = false;

let ignitionWatchStatus: IgnitionWatchStatus = {
  isEnabled: false,
  isIgnitionOn: false,
  engineState: "unknown",
  engineHasRunThisSession: false,
  engineStoppedAt: null,
  postShutdownLoggingMs: 180000,
  postShutdownRemainingMs: null,
  probeIntervalMs: 10000,
  monitoringIntervalSeconds: 5,
  startedAt: null,
  stoppedAt: null,
  lastProbeAt: null,
  lastSuccessfulProbeAt: null,
  lastError: null,
  consecutiveOnDetections: 0,
  consecutiveOffDetections: 0
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function sendCommand(
  port: SerialPort,
  command: string,
  timeoutMs = 3000
): Promise<string> {
  return new Promise((resolve, reject) => {
    let buffer = "";

    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error(`Timed out waiting for ${command}`));
    }, timeoutMs);

    function cleanup() {
      clearTimeout(timeout);
      port.off("data", onData);
    }

    function onData(data: Buffer) {
      buffer += data.toString("utf8");

      if (buffer.includes(">")) {
        cleanup();
        resolve(buffer);
      }
    }

    port.on("data", onData);

    port.write(`${command}\r`, (error) => {
      if (error) {
        cleanup();
        reject(error);
      }
    });
  });
}

async function openPort(): Promise<SerialPort> {
  const port = new SerialPort({
    path: OBD_PORT,
    baudRate: OBD_BAUD_RATE,
    autoOpen: false
  });

  await new Promise<void>((resolve, reject) => {
    port.open((error) => {
      if (error) reject(error);
      else resolve();
    });
  });

  return port;
}

async function closePort(port: SerialPort) {
  if (!port.isOpen) return;

  await new Promise<void>((resolve) => {
    port.close(() => resolve());
  });
}

async function probeEcuAwakeOverObd(): Promise<boolean> {
  const port = await openPort();

  try {
    const initCommands = ["ATE0", "ATL0", "ATS0", "ATH0", "ATSP0"];

    for (const command of initCommands) {
      await sendCommand(port, command, 3000).catch(() => "");
      await sleep(100);
    }

    const response = await sendCommand(port, "0100", 5000);

    const normalizedResponse = response
      .toUpperCase()
      .replace(/[^A-F0-9]/g, "");

    return normalizedResponse.includes("4100");
  } finally {
    await closePort(port);
  }
}

function calculatePostShutdownRemainingMs() {
  if (!ignitionWatchStatus.engineStoppedAt) return null;

  const stoppedAtMs = new Date(ignitionWatchStatus.engineStoppedAt).getTime();
  const elapsedMs = Date.now() - stoppedAtMs;
  const remainingMs = ignitionWatchStatus.postShutdownLoggingMs - elapsedMs;

  return Math.max(0, remainingMs);
}

function markEcuAwake() {
  ignitionWatchStatus = {
    ...ignitionWatchStatus,
    isIgnitionOn: true,
    engineState: "ecu_awake",
    lastSuccessfulProbeAt: new Date().toISOString(),
    lastError: null,
    consecutiveOnDetections: ignitionWatchStatus.consecutiveOnDetections + 1,
    consecutiveOffDetections: 0,
    postShutdownRemainingMs: null
  };
}

function markEngineRunning() {
  ignitionWatchStatus = {
    ...ignitionWatchStatus,
    isIgnitionOn: true,
    engineState: "engine_running",
    engineHasRunThisSession: true,
    engineStoppedAt: null,
    postShutdownRemainingMs: null,
    lastSuccessfulProbeAt: new Date().toISOString(),
    lastError: null,
    consecutiveOnDetections: ignitionWatchStatus.consecutiveOnDetections + 1,
    consecutiveOffDetections: 0
  };
}

function markPostRunLogging() {
  const stoppedAt =
    ignitionWatchStatus.engineStoppedAt || new Date().toISOString();

  ignitionWatchStatus = {
    ...ignitionWatchStatus,
    isIgnitionOn: true,
    engineState: "post_run_logging",
    engineStoppedAt: stoppedAt,
    postShutdownRemainingMs: calculatePostShutdownRemainingMs(),
    lastSuccessfulProbeAt: new Date().toISOString(),
    lastError: null,
    consecutiveOnDetections: ignitionWatchStatus.consecutiveOnDetections + 1,
    consecutiveOffDetections: 0
  };
}

function markOff(errorMessage?: string) {
  ignitionWatchStatus = {
    ...ignitionWatchStatus,
    isIgnitionOn: false,
    engineState: "off",
    postShutdownRemainingMs: null,
    lastError: errorMessage || null,
    consecutiveOnDetections: 0,
    consecutiveOffDetections: ignitionWatchStatus.consecutiveOffDetections + 1
  };
}

async function runIgnitionCheck() {
  if (!ignitionWatchStatus.isEnabled) return;
  if (isProbing) return;

  const monitoringStatus = getMonitoringStatus();

  ignitionWatchStatus = {
    ...ignitionWatchStatus,
    lastProbeAt: new Date().toISOString()
  };

  if (monitoringStatus.isRunning) {
    const latestRpm = monitoringStatus.latestSnapshot?.liveData.rpm ?? 0;

    if (latestRpm > 0) {
      markEngineRunning();
      return;
    }

    if (ignitionWatchStatus.engineHasRunThisSession) {
      markPostRunLogging();

      const remainingMs = calculatePostShutdownRemainingMs();

      ignitionWatchStatus = {
        ...ignitionWatchStatus,
        postShutdownRemainingMs: remainingMs
      };

      if (remainingMs !== null && remainingMs <= 0) {
        await stopMonitoring();
        markOff("Post-shutdown logging completed after RPM stayed at 0.");
      }

      return;
    }

    // ECU is awake, but this session has not seen the engine run yet.
    // Keep logging so we can capture key-on and start-up data.
    markEcuAwake();
    return;
  }

  isProbing = true;

  try {
    const ecuAwake = await probeEcuAwakeOverObd();

    if (ecuAwake) {
      markEcuAwake();
      await startMonitoring(ignitionWatchStatus.monitoringIntervalSeconds);
    } else {
      markOff("ECU did not respond to OBD-II probe.");
    }
  } catch (error) {
    markOff(
      error instanceof Error ? error.message : "Unknown ignition probe error"
    );
  } finally {
    isProbing = false;
  }
}

export async function startIgnitionWatch(options?: {
  probeIntervalSeconds?: number;
  monitoringIntervalSeconds?: number;
  postShutdownLoggingSeconds?: number;
}) {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }

  const probeIntervalMs = Math.max(
    5000,
    Math.min(Number(options?.probeIntervalSeconds || 10) * 1000, 60000)
  );

  const monitoringIntervalSeconds = Math.max(
    2,
    Math.min(Number(options?.monitoringIntervalSeconds || 5), 60)
  );

  const postShutdownLoggingMs = Math.max(
    30000,
    Math.min(Number(options?.postShutdownLoggingSeconds || 180) * 1000, 900000)
  );

  ignitionWatchStatus = {
    ...ignitionWatchStatus,
    isEnabled: true,
    isIgnitionOn: false,
    engineState: "unknown",
    engineHasRunThisSession: false,
    engineStoppedAt: null,
    postShutdownLoggingMs,
    postShutdownRemainingMs: null,
    probeIntervalMs,
    monitoringIntervalSeconds,
    startedAt: new Date().toISOString(),
    stoppedAt: null,
    lastError: null,
    consecutiveOnDetections: 0,
    consecutiveOffDetections: 0
  };

  void runIgnitionCheck();

  timer = setInterval(() => {
    void runIgnitionCheck();
  }, probeIntervalMs);

  return ignitionWatchStatus;
}

export async function stopIgnitionWatch() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }

  ignitionWatchStatus = {
    ...ignitionWatchStatus,
    isEnabled: false,
    stoppedAt: new Date().toISOString()
  };

  return ignitionWatchStatus;
}

export function getIgnitionWatchStatus() {
  return {
    ...ignitionWatchStatus,
    postShutdownRemainingMs: calculatePostShutdownRemainingMs()
  };
}
