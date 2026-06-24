import type { TroubleCode } from "../../types/obd.js";

const dtcTable: Record<string, Omit<TroubleCode, "code">> = {
  P0171: {
    description: "System Too Lean Bank 1",
    system: "Fuel / Air Metering",
    severity: "Medium",
    possibleCauses: [
      "Vacuum leak",
      "Dirty mass airflow sensor",
      "Weak fuel pressure",
      "Exhaust leak before oxygen sensor"
    ]
  },
  P0302: {
    description: "Cylinder 2 Misfire Detected",
    system: "Ignition / Misfire",
    severity: "Medium",
    possibleCauses: [
      "Worn spark plug",
      "Faulty ignition coil",
      "Fuel injector issue",
      "Compression issue"
    ]
  }
};

export function lookupTroubleCode(code: string): TroubleCode {
  const match = dtcTable[code];

  if (!match) {
    return {
      code,
      description: "Unknown diagnostic trouble code",
      system: "Unknown",
      severity: "Medium",
      possibleCauses: [
        "Check manufacturer service information for this code"
      ]
    };
  }

  return {
    code,
    ...match
  };
}
