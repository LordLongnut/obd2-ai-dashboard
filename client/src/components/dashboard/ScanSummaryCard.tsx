import type { AiDiagnosis, ObdScan, Severity } from "../../types/obd";

type ScanSource = "simulated" | "live" | null;

type ScanSummaryCardProps = {
  scan: ObdScan;
  scanSource: ScanSource;
  diagnosis: AiDiagnosis | null;
};

function getHighestSeverity(severities: Severity[]): Severity | "None" {
  if (severities.includes("High")) return "High";
  if (severities.includes("Medium")) return "Medium";
  if (severities.includes("Low")) return "Low";
  return "None";
}

function ScanSummaryCard({
  scan,
  scanSource,
  diagnosis
}: ScanSummaryCardProps) {
  const codesFound = scan.troubleCodes.length;
  const highestSeverity = getHighestSeverity(
    scan.troubleCodes.map((code) => code.severity)
  );

  const sourceLabel =
    scanSource === "live"
      ? "Live OBDLink EX"
      : scanSource === "simulated"
        ? "Simulated ELM327"
        : "Unknown";

  const aiStatus = diagnosis ? "Analysis complete" : "Ready for analysis";
  const milStatus = scan.monitorStatus
    ? scan.monitorStatus.milOn
      ? "MIL On"
      : "MIL Off"
    : "Unknown";

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold">Scan Summary</h3>
          <p className="text-slate-400 text-sm">
            {new Date(scan.createdAt).toLocaleString()}
          </p>
        </div>

        <span className="w-fit rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">
          Scan Complete
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
          <p className="text-slate-500 text-sm">Source</p>
          <p className="font-semibold">{sourceLabel}</p>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
          <p className="text-slate-500 text-sm">Codes Found</p>
          <p className="font-semibold">{codesFound}</p>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
          <p className="text-slate-500 text-sm">MIL Status</p>
          <p className="font-semibold">{milStatus}</p>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
          <p className="text-slate-500 text-sm">Highest Severity</p>
          <p className="font-semibold">{highestSeverity}</p>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
          <p className="text-slate-500 text-sm">AI Status</p>
          <p className="font-semibold">{aiStatus}</p>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
          <p className="text-slate-500 text-sm">Live Data</p>
          <p className="font-semibold">
            {scan.liveData.rpm > 0 ? "Active" : "No RPM"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ScanSummaryCard;
