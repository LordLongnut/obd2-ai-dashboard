import type { TroubleCode, TroubleCodeStatus } from "../../types/obd.js";

const dtcTable: Record<string, Omit<TroubleCode, "code" | "status">> = {
  P0101: {
    description: "Mass Air Flow Sensor Performance",
    system: "Fuel / Air Metering",
    severity: "Medium",
    possibleCauses: [
      "Dirty mass airflow sensor",
      "Air leak after MAF sensor",
      "Restricted air intake",
      "MAF wiring or connector issue"
    ]
  },
  P0135: {
    description: "O2 Sensor Heater Circuit Bank 1 Sensor 1",
    system: "Oxygen Sensor / Heater Circuit",
    severity: "Medium",
    possibleCauses: [
      "Failed oxygen sensor heater element",
      "Blown O2 sensor heater fuse",
      "Damaged wiring",
      "Poor connector contact"
    ]
  },
  P0141: {
    description: "O2 Sensor Heater Circuit Bank 1 Sensor 2",
    system: "Oxygen Sensor / Heater Circuit",
    severity: "Medium",
    possibleCauses: [
      "Failed downstream oxygen sensor heater",
      "Blown O2 heater fuse",
      "Damaged wiring",
      "Poor connector contact"
    ]
  },
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
  P0300: {
    description: "Random / Multiple Cylinder Misfire Detected",
    system: "Ignition / Misfire",
    severity: "High",
    possibleCauses: [
      "Ignition system fault",
      "Fuel delivery issue",
      "Vacuum leak",
      "Mechanical engine issue"
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
  },
  P0442: {
    description: "EVAP System Small Leak Detected",
    system: "EVAP / Emissions",
    severity: "Low",
    possibleCauses: [
      "Loose gas cap",
      "Small EVAP hose leak",
      "Purge valve issue",
      "Vent valve issue"
    ]
  }
};

export function lookupTroubleCode(
  code: string,
  status: TroubleCodeStatus = "Stored"
): TroubleCode {
  const match = dtcTable[code];

  if (!match) {
    return {
      code,
      status,
      description: "Unknown diagnostic trouble code",
      system: "Unknown",
      severity: "Medium",
      possibleCauses: ["Check manufacturer service information for this code"]
    };
  }

  return {
    code,
    status,
    ...match
  };
}
