import type { ObdScan } from "../../types/obd.js";
import { buildDiagnosisPrompt } from "./promptBuilder.js";

export function getMockDiagnosis(scan: ObdScan) {
  const prompt = buildDiagnosisPrompt(scan);

  console.log("\n--- Generated AI Diagnostic Prompt ---");
  console.log(prompt);
  console.log("--- End Prompt ---\n");

  const vehicleName = `${scan.vehicle.year} ${scan.vehicle.make} ${scan.vehicle.model} ${scan.vehicle.engine}`;
  const codes = scan.troubleCodes.map((dtc) => dtc.code).join(", ");
  const longTermTrim = scan.liveData.longTermFuelTrimBank1Percent;
  const hasLeanCode = scan.troubleCodes.some((dtc) => dtc.code === "P0171");
  const hasMisfireCode = scan.troubleCodes.some((dtc) => dtc.code.startsWith("P030"));

  let summary = `${vehicleName} has stored codes ${codes}.`;

  if (hasLeanCode && hasMisfireCode) {
    summary += ` The scan shows a lean condition along with a misfire. The long-term fuel trim is ${longTermTrim}%, which suggests the ECU has been adding fuel over time. This points toward unmetered air, inaccurate airflow measurement, or fuel delivery issues. The misfire should be diagnosed together with the lean condition instead of replacing ignition parts blindly.`;
  } else if (hasLeanCode) {
    summary += ` The scan shows a lean condition. The fuel trim data suggests the ECU is correcting for a mixture problem.`;
  } else if (hasMisfireCode) {
    summary += ` The scan shows a misfire condition. Ignition, fuel, and mechanical causes should be checked in order.`;
  } else {
    summary += ` The scan data should be reviewed alongside symptoms before replacing parts.`;
  }

  return {
    summary,
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
      "Avoid replacing the catalytic converter, oxygen sensors, or ECU until fuel trim and misfire basics are verified"
    ]
  };
}
