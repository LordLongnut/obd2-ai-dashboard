import type { ObdScan } from "../../types/obd.js";

export function getMockDiagnosis(scan: ObdScan) {
  const vehicleName = `${scan.vehicle.year} ${scan.vehicle.make} ${scan.vehicle.model} ${scan.vehicle.engine}`;
  const codes = scan.troubleCodes.map((dtc) => dtc.code).join(", ");

  return {
    summary:
      `${vehicleName} has stored codes ${codes}. The scan shows a lean condition along with a cylinder 2 misfire. The positive long-term fuel trim suggests the ECU has been adding fuel over time, which commonly points toward unmetered air, inaccurate airflow measurement, or a fuel delivery issue. The cylinder 2 misfire should be diagnosed alongside the lean condition instead of replacing parts blindly.`,
    severity: "Medium",
    likelyCauses: [
      "Vacuum leak or intake air leak",
      "Dirty or inaccurate mass airflow sensor",
      "Weak fuel pressure",
      "Cylinder 2 ignition coil or spark plug issue",
      "Cylinder 2 injector issue"
    ],
    nextSteps: [
      "Smoke test the intake system for vacuum leaks",
      "Compare fuel trims at idle and at 2500 RPM",
      "Inspect spark plug and ignition coil on cylinder 2",
      "Verify fuel pressure under load",
      "Check MAF readings against expected values",
      "Clear codes after repairs and confirm fuel trims return near zero"
    ]
  };
}
