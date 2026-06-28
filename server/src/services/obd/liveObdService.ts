import type { ObdScan } from "../../types/obd.js";
import { lookupTroubleCode } from "./dtcLookupService.js";
import { readLiveElm327Snapshot } from "./liveElm327Service.js";
import {
  parseBarometricPressureKpa,
  parseControlModuleVoltage,
  parseCoolantTempF,
  parseDtcResponse,
  parseEngineLoadPercent,
  parseEngineRpm,
  parseFuelLevelPercent,
  parseFuelTrimPercent,
  parseIntakeAirTempF,
  parseMafGps,
  parseMapKpa,
  parseMonitorStatus,
  parseO2SensorVoltage,
  parseRunTimeSeconds,
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

function safeOptionalNumber(parseFn: () => number): number | undefined {
  try {
    return parseFn();
  } catch {
    return undefined;
  }
}

export async function getLiveObdScan(): Promise<ObdScan> {
  const raw = await readLiveElm327Snapshot();

  const storedCodes = parseDtcResponse(raw.storedTroubleCodes, 0x43).map(
    (code) => lookupTroubleCode(code, "Stored")
  );

  const pendingCodes = parseDtcResponse(raw.pendingTroubleCodes, 0x47).map(
    (code) => lookupTroubleCode(code, "Pending")
  );

  const permanentCodes = parseDtcResponse(raw.permanentTroubleCodes, 0x4a).map(
    (code) => lookupTroubleCode(code, "Permanent")
  );

  const troubleCodes = [...storedCodes, ...pendingCodes, ...permanentCodes];

  const monitorStatus =
    raw.monitorStatus.trim().length > 0
      ? parseMonitorStatus(raw.monitorStatus)
      : undefined;

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
      parseO2SensorVoltage(raw.o2Bank1Sensor1, 0x14)
    ),

    mapKpa: safeOptionalNumber(() => parseMapKpa(raw.map)),
    o2SensorVoltageBank1Sensor2: safeOptionalNumber(() =>
      parseO2SensorVoltage(raw.o2Bank1Sensor2, 0x15)
    ),
    runTimeSeconds: safeOptionalNumber(() => parseRunTimeSeconds(raw.runTime)),
    fuelLevelPercent: safeOptionalNumber(() =>
      parseFuelLevelPercent(raw.fuelLevel)
    ),
    barometricPressureKpa: safeOptionalNumber(() =>
      parseBarometricPressureKpa(raw.barometricPressure)
    ),
    controlModuleVoltage: safeOptionalNumber(() =>
      parseControlModuleVoltage(raw.controlModuleVoltage)
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
    monitorStatus,
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
