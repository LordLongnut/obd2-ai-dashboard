import type { MonitoringStatus } from "../../services/monitoringApi";

type MonitoringPanelProps = {
  status: MonitoringStatus | null;
  onStart: () => void;
  onStop: () => void;
  onRefresh: () => void;
  isBusy: boolean;
};

function MonitoringPanel({
  status,
  onStart,
  onStop,
  onRefresh,
  isBusy
}: MonitoringPanelProps) {
  const latest = status?.latestSnapshot;
  const alerts = status?.activeAlerts || [];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold">Fleet Monitoring Mode</h3>
          <p className="text-slate-400 text-sm">
            Continuous OBD-II polling for under-dash fleet device simulation.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={onStart}
            disabled={isBusy || status?.isRunning}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-900 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-semibold"
          >
            Start Monitoring
          </button>

          <button
            onClick={onStop}
            disabled={isBusy || !status?.isRunning}
            className="bg-red-600 hover:bg-red-700 disabled:bg-red-900 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-semibold"
          >
            Stop Monitoring
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

      <div className="grid sm:grid-cols-4 gap-3 mb-4">
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
          <p className="text-slate-500 text-xs uppercase">Status</p>
          <p className={status?.isRunning ? "text-emerald-300" : "text-slate-300"}>
            {status?.isRunning ? "Running" : "Stopped"}
          </p>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
          <p className="text-slate-500 text-xs uppercase">Interval</p>
          <p>{status ? `${status.intervalMs / 1000}s` : "-"}</p>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
          <p className="text-slate-500 text-xs uppercase">Samples</p>
          <p>{status?.samplesCollected ?? 0}</p>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
          <p className="text-slate-500 text-xs uppercase">Alerts</p>
          <p>{alerts.length}</p>
        </div>
      </div>

      {status?.lastError && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-200 rounded-lg p-3 mb-4">
          {status.lastError}
        </div>
      )}

      {latest && (
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 mb-4">
          <p className="font-semibold mb-2">Latest Snapshot</p>

          <div className="grid sm:grid-cols-3 gap-3 text-sm">
            <p>
              <span className="text-slate-500">RPM:</span> {latest.liveData.rpm}
            </p>
            <p>
              <span className="text-slate-500">Speed:</span>{" "}
              {latest.liveData.vehicleSpeedMph} mph
            </p>
            <p>
              <span className="text-slate-500">Coolant:</span>{" "}
              {latest.liveData.coolantTempF}°F
            </p>
            <p>
              <span className="text-slate-500">Load:</span>{" "}
              {latest.liveData.engineLoadPercent}%
            </p>
            <p>
              <span className="text-slate-500">LTFT B1:</span>{" "}
              {latest.liveData.longTermFuelTrimBank1Percent}%
            </p>
            <p>
              <span className="text-slate-500">Codes:</span>{" "}
              {latest.troubleCodes.length}
            </p>
          </div>
        </div>
      )}

      {alerts.length > 0 ? (
        <div className="space-y-2">
          <p className="font-semibold">Active Rule-Based Alerts</p>

          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3"
            >
              <div className="flex flex-wrap gap-2 items-center mb-1">
                <span className="font-semibold text-yellow-200">
                  {alert.title}
                </span>
                <span className="text-xs bg-yellow-500/10 text-yellow-300 border border-yellow-500/20 rounded-full px-2 py-0.5">
                  {alert.severity}
                </span>
                {alert.pid && (
                  <span className="text-xs bg-slate-800 text-slate-300 border border-slate-700 rounded-full px-2 py-0.5">
                    {alert.pid}
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-300">{alert.message}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-400 text-sm">
          No active monitoring alerts from the latest sample.
        </p>
      )}
    </div>
  );
}

export default MonitoringPanel;
