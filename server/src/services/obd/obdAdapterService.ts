import { getMockElm327Snapshot } from "./mockElm327Service.js";
import { getRealElm327Snapshot } from "./realObdService.js";

export type RawObdSnapshot = {
  engineLoad: string;
  coolantTemp: string;
  shortTermFuelTrimBank1: string;
  longTermFuelTrimBank1: string;
  rpm: string;
  vehicleSpeed: string;
  intakeAirTemp: string;
  maf: string;
  throttlePosition: string;
  o2Bank1Sensor1: string;
  storedTroubleCodes: string;
};

export function getObdSnapshot(): RawObdSnapshot {
  const adapterMode = process.env.OBD_ADAPTER_MODE || "mock";

  if (adapterMode === "real") {
    return getRealElm327Snapshot();
  }

  return getMockElm327Snapshot();
}

export function getAdapterMode() {
  return {
    mode: process.env.OBD_ADAPTER_MODE || "mock",
    realAdapterReady: false
  };
}
