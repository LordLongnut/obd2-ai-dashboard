import type { ObdScan } from "../../types/obd.js";
import { getMockElm327Snapshot } from "./mockElm327Service.js";
import { lookupTroubleCode } from "./dtcLookupService.js";
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

export function getMockScan(): ObdScan {
  const raw = getMockElm327Snapshot();

  const dtcCodes = parseDtcResponse(raw.storedTroubleCodes);
  const troubleCodes = dtcCodes.map(lookupTroubleCode);

  const liveData = {
    rpm: parseEngineRpm(raw.rpm),
    vehicleSpeedMph: parseVehicleSpeedMph(raw.vehicleSpeed),
    coolantTempF: parseCoolantTempF(raw.coolantTemp),
    intakeAirTempF: parseIntakeAirTempF(raw.intakeAirTemp),
    engineLoadPercent: parseEngineLoadPercent(raw.engineLoad),
    throttlePositionPercent: parseThrottlePositionPercent(raw.throttlePosition),
    mafGps: parseMafGps(raw.maf),
    shortTermFuelTrimBank1Percent: parseFuelTrimPercent(raw.shortTermFuelTrimBank1),
    longTermFuelTrimBank1Percent: parseFuelTrimPercent(raw.longTermFuelTrimBank1),
    o2SensorVoltageBank1Sensor1: parseO2SensorVoltage(raw.o2Bank1Sensor1)
  };

  return {
    id: "scan-001",
    createdAt: new Date().toISOString(),
    vehicle: {
      year: 2015,
      make: "Audi",
      model: "Q5",
      engine: "2.0T",
      vin: "WA1LFAFP0FA000000",
      mileage: 142350
    },
    liveData,
    troubleCodes,
    freezeFrame: {
      rpm: 1860,
      vehicleSpeedMph: 34,
      coolantTempF: 188,
      engineLoadPercent: 54,
      fuelTrimBank1Percent: 10.2
    },
    readinessMonitors: {
      catalyst: "Ready",
      evaporativeSystem: "Not Ready",
      oxygenSensor: "Ready",
      oxygenSensorHeater: "Ready",
      egrSystem: "Ready"
    }
  };
}
