import { api } from "./api";

export type EngineState =
  | "unknown"
  | "ecu_awake"
  | "engine_running"
  | "post_run_logging"
  | "off";

export type IgnitionWatchStatus = {
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

export async function startIgnitionWatch() {
  const response = await api.post<IgnitionWatchStatus>(
    "/ignition/watch/start",
    {
      probeIntervalSeconds: 10,
      monitoringIntervalSeconds: 5,
      postShutdownLoggingSeconds: 180
    }
  );

  return response.data;
}

export async function stopIgnitionWatch() {
  const response = await api.post<IgnitionWatchStatus>(
    "/ignition/watch/stop"
  );

  return response.data;
}

export async function fetchIgnitionWatchStatus() {
  const response = await api.get<IgnitionWatchStatus>(
    "/ignition/watch/status"
  );

  return response.data;
}
