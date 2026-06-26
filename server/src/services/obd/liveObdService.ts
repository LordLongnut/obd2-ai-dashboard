import type { ObdScan } from "../../types/obd.js";
import { lookupTroubleCode } from "./dtcLookupService.js";
import { readLiveElm327Snapshot } from "./liveElm327Service.js";
import {
  parseCoolantTempF,
  parseDtcResponse,
  parseEngineLoadPercent,
  parseEngineRpm,
  parseFuelTrimPercent,
  parseIntakeAirTempF,
  parseMafGps,
  parseO2SensorVoltage,
  parseThrottlePositionPercent,
  parseVehicleSpeedMph
} from "./obdParser.js";

function safeNumber(parseFn: () => number, fallback = 0): number {
  try {
    return parseFn();
  } catch {
    return fallback;
  }
}

export async function getLiveObdScan(): Promise<ObdScan> {
  const raw = await readLiveElm327Snapshot();

  const dtcCodes = parseDtcResponse(raw.storedTroubleCodes);
  const troubleCodes = dtcCodes.map(lookupTroubleCode);

  const liveData = {
    rpm: safeNumber(() => parseEngineRpm(raw.rpm)),
    vehicleSpeedMph: safeNumber(() => parseVehicleSpeedMph(raw.vehicleSpeed)),
    coolantTempF: safeNumber(() => parseCoolantTempF(raw.coolantTemp)),
    intakeAirTempF: safeNumber(() => parseIntakeAirTempF(raw.intakeAirTemp)),
    engineLoadPercent: safeNumber(() => parseEngineLoadPercent(raw.engineLoad)),
    throttlePositionPercent: safeNumber(() =>
      parseThrottlePositionPercent(raw.throttlePosition)
    ),
    mafGps: safeNumber(() => parseMafGps(raw.maf)),
    shortTermFuelTrimBank1Percent: safeNumber(() =>
      parseFuelTrimPercent(raw.shortTermFuelTrimBank1, 0x06)
    ),
    longTermFuelTrimBank1Percent: safeNumber(() =>
      parseFuelTrimPercent(raw.longTermFuelTrimBank1, 0x07)
    ),
    o2SensorVoltageBank1Sensor1: safeNumber(() =>
      parseO2SensorVoltage(raw.o2Bank1Sensor1)
    )
  };

  return {
    id: `live-scan-${Date.now()}`,
    createdAt: new Date().toISOString(),
    vehicle: {
      year: 0,
      make: "Live",
      model: "OBD-II Vehicle",
      engine: "Unknown",
      vin: "UNKNOWN",
      mileage: 0
    },
    liveData,
    troubleCodes,
    freezeFrame: {
      rpm: liveData.rpm,
      vehicleSpeedMph: liveData.vehicleSpeedMph,
      coolantTempF: liveData.coolantTempF,
      engineLoadPercent: liveData.engineLoadPercent,
      fuelTrimBank1Percent: liveData.longTermFuelTrimBank1Percent
    },
    readinessMonitors: {
      catalyst: "Not Ready",
      evaporativeSystem: "Not Ready",
      oxygenSensor: "Not Ready",
      oxygenSensorHeater: "Not Ready",
      egrSystem: "Not Ready"
    }
  };
}
