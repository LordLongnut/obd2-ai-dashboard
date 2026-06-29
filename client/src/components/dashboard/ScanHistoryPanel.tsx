import type { SavedScanRecord } from "../../services/scanApi";

type ScanHistoryPanelProps = {
  records: SavedScanRecord[];
  onRefresh: () => void;
  lastSavedScanId: string | null;
};

function getVehicleLabel(record: SavedScanRecord) {
  const vehicle = record.scan.vehicle;

  if (vehicle.year === 0 || vehicle.make === "Live") {
    return vehicle.vin && vehicle.vin !== "UNKNOWN"
      ? `Live OBD-II Vehicle - VIN ${vehicle.vin}`
      : "Live OBD-II Vehicle";
  }

  return `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.engine}`;
}

function ScanHistoryPanel({
  records,
  onRefresh,
  lastSavedScanId
}: ScanHistoryPanelProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold">Scan History</h3>
          <p className="text-slate-400 text-sm">
            Saved diagnostic scan sessions from this machine.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 rounded-lg font-semibold"
        >
          Refresh History
        </button>
      </div>

      {records.length === 0 ? (
        <p className="text-slate-400">No saved scans yet.</p>
      ) : (
        <div className="space-y-3">
          {records.slice(0, 5).map((record) => (
            <div
              key={record.id}
              className="bg-slate-950 border border-slate-800 rounded-lg p-4"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-semibold">{getVehicleLabel(record)}</p>
                  <p className="text-slate-400 text-sm">
                    {new Date(record.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {record.id === lastSavedScanId && (
                    <span className="text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-full px-3 py-1">
                      Just Saved
                    </span>
                  )}

                  <span className="text-xs bg-blue-500/10 text-blue-300 border border-blue-500/20 rounded-full px-3 py-1">
                    {record.scanSource || "unknown"}
                  </span>

                  <span className="text-xs bg-yellow-500/10 text-yellow-300 border border-yellow-500/20 rounded-full px-3 py-1">
                    {record.diagnosis.severity}
                  </span>
                </div>
              </div>

              <div className="mt-3 text-sm text-slate-300">
                <p>Codes: {record.scan.troubleCodes.length}</p>
                <p className="mt-1 line-clamp-2">
                  AI: {record.diagnosis.summary}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ScanHistoryPanel;
