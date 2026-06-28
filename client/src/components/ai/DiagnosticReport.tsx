import { useState } from "react";
import type { AiDiagnosis, ObdScan } from "../../types/obd";

type ScanSource = "simulated" | "live" | null;

type DiagnosticReportProps = {
  scan: ObdScan;
  diagnosis: AiDiagnosis;
  symptoms: string;
  scanSource: ScanSource;
};

function getVehicleLabel(scan: ObdScan) {
  if (scan.vehicle.year === 0 || scan.vehicle.vin === "UNKNOWN") {
    return "Live OBD-II Vehicle";
  }

  return `${scan.vehicle.year} ${scan.vehicle.make} ${scan.vehicle.model} ${scan.vehicle.engine}`;
}

function buildReportText({
  scan,
  diagnosis,
  symptoms,
  scanSource
}: DiagnosticReportProps) {
  const vehicle = getVehicleLabel(scan);
  const source =
    scanSource === "live"
      ? "Live OBDLink EX scan"
      : scanSource === "simulated"
        ? "Simulated ELM327 scan"
        : "Unknown scan source";

  const codes =
    scan.troubleCodes.length > 0
      ? scan.troubleCodes
          .map((dtc) => {
            const status = dtc.status ? ` (${dtc.status})` : "";
            return `- ${dtc.code}${status}: ${dtc.description}`;
          })
          .join("\n")
      : "No fault codes found.";

  const notes = symptoms.trim() || "No driver/technician notes provided.";

  return `
OBD2 AI Diagnostic Report

Vehicle:
${vehicle}

Scan Source:
${source}

Scan Time:
${new Date(scan.createdAt).toLocaleString()}

Fault Codes:
${codes}

Live Data Highlights:
- RPM: ${scan.liveData.rpm}
- Vehicle Speed: ${scan.liveData.vehicleSpeedMph} mph
- Coolant Temp: ${scan.liveData.coolantTempF}°F
- Engine Load: ${scan.liveData.engineLoadPercent}%
- STFT Bank 1: ${scan.liveData.shortTermFuelTrimBank1Percent}%
- LTFT Bank 1: ${scan.liveData.longTermFuelTrimBank1Percent}%
- MAF: ${scan.liveData.mafGps} g/s
- Throttle Position: ${scan.liveData.throttlePositionPercent}%

Driver / Technician Notes:
${notes}

AI Severity:
${diagnosis.severity}

AI Summary:
${diagnosis.summary}

Likely Causes:
${diagnosis.likelyCauses.map((cause) => `- ${cause}`).join("\n")}

Next Diagnostic Steps:
${diagnosis.nextSteps.map((step) => `- ${step}`).join("\n")}
`.trim();
}

function DiagnosticReport({
  scan,
  diagnosis,
  symptoms,
  scanSource
}: DiagnosticReportProps) {
  const [copied, setCopied] = useState(false);

  const reportText = buildReportText({
    scan,
    diagnosis,
    symptoms,
    scanSource
  });

  async function copyReport() {
    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy report:", error);
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold">Diagnostic Report</h3>
          <p className="text-slate-400 text-sm">
            Copy-ready summary for notes, customers, or a repair order.
          </p>
        </div>

        <button
          onClick={copyReport}
          className="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 rounded-lg font-semibold"
        >
          {copied ? "Copied" : "Copy Report"}
        </button>
      </div>

      <pre className="whitespace-pre-wrap bg-slate-950 border border-slate-800 rounded-lg p-4 text-sm text-slate-200 leading-relaxed">
        {reportText}
      </pre>
    </div>
  );
}

export default DiagnosticReport;
