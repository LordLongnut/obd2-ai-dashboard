import type { TroubleCode } from "../../types/obd.js";

const dtcTable: Record<string, Omit<TroubleCode, "code">> = {
  P0155: {
    description: "O2 Sensor Heater Circuit Bank 2 Sensor 1",
    system: "Oxygen Sensor / Heater Circuit",
    severity: "Medium",
    possibleCauses: [
      "Failed oxygen sensor heater element",
      "Blown O2 sensor heater fuse",
      "Damaged wiring to bank 2 sensor 1",
      "Poor connector contact",
      "PCM driver issue"
    ]
  },
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
  P0172: {
    description: "System Too Rich Bank 1",
    system: "Fuel / Air Metering",
    severity: "Medium",
    possibleCauses: [
      "Leaking fuel injector",
      "Excessive fuel pressure",
      "Contaminated mass airflow sensor",
      "Restricted air intake"
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
  },
  P0420: {
    description: "Catalyst System Efficiency Below Threshold Bank 1",
    system: "Emissions / Catalyst",
    severity: "Medium",
    possibleCauses: [
      "Aging catalytic converter",
      "Exhaust leak",
      "Oxygen sensor issue",
      "Engine running rich or lean over time"
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
      possibleCauses: ["Check manufacturer service information for this code"]
    };
  }

  return {
    code,
    ...match
  };
}
