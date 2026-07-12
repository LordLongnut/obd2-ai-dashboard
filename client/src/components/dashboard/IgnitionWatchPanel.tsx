import type { EngineState, IgnitionWatchStatus } from "../../services/ignitionApi";

type IgnitionWatchPanelProps = {
  status: IgnitionWatchStatus | null;
  onStart: () => void;
  onStop: () => void;
  onRefresh: () => void;
  isBusy: boolean;
};

function formatEngineState(state?: EngineState) {
  switch (state) {
    case "ecu_awake":
      return "ECU Awake / Pre-Start";
    case "engine_running":
      return "Engine Running";
    case "post_run_logging":
      return "Post-Run Logging";
    case "off":
      return "Off";
    default:
      return "Unknown";
  }
}

function formatRemaining(ms: number | null | undefined) {
  if (ms === null || ms === undefined) return "-";

  const seconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function IgnitionWatchPanel({
  status,
  onStart,
  onStop,
  onRefresh,
  isBusy
}: IgnitionWatchPanelProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold">Ignition Watch</h3>
          <p className="text-slate-400 text-sm">
            Starts logging when the ECU wakes up, then stops after RPM stays at 0 for 180 seconds after running.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={onStart}
            disabled={isBusy || status?.isEnabled}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-900 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-semibold"
          >
            Enable Ignition Watch
          </button>

          <button
            onClick={onStop}
            disabled={isBusy || !status?.isEnabled}
            className="bg-red-600 hover:bg-red-700 disabled:bg-red-900 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-semibold"
          >
            Disable
          </button>

          <button
            onClick={onRefresh}
            disabled={isBusy}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 rounded-lg font-semibold"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-5 gap-3">
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
          <p className="text-slate-500 text-xs uppercase">Watch</p>
          <p className={status?.isEnabled ? "text-emerald-300" : "text-slate-300"}>
            {status?.isEnabled ? "Enabled" : "Disabled"}
          </p>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
          <p className="text-slate-500 text-xs uppercase">OBD / Ignition</p>
          <p className={status?.isIgnitionOn ? "text-emerald-300" : "text-slate-300"}>
            {status?.isIgnitionOn ? "Awake" : "Not Detected"}
          </p>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
          <p className="text-slate-500 text-xs uppercase">Engine State</p>
          <p>{formatEngineState(status?.engineState)}</p>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
          <p className="text-slate-500 text-xs uppercase">Post-Run Left</p>
          <p>{formatRemaining(status?.postShutdownRemainingMs)}</p>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
          <p className="text-slate-500 text-xs uppercase">Logging</p>
          <p>{status ? `${status.monitoringIntervalSeconds}s` : "-"}</p>
        </div>
      </div>

      {status?.engineStoppedAt && (
        <p className="text-slate-400 text-sm mt-3">
          Engine stopped at: {new Date(status.engineStoppedAt).toLocaleString()}
        </p>
      )}

      {status?.lastProbeAt && (
        <p className="text-slate-400 text-sm mt-2">
          Last probe: {new Date(status.lastProbeAt).toLocaleString()}
        </p>
      )}

      {status?.lastError && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 rounded-lg p-3 mt-4">
          {status.lastError}
        </div>
      )}
    </div>
  );
}

export default IgnitionWatchPanel;