import type { ObdScan } from "../../types/obd.js";

export function getMockScan(): ObdScan {
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
    liveData: {
      rpm: 820,
      vehicleSpeedMph: 0,
      coolantTempF: 196,
      intakeAirTempF: 91,
      engineLoadPercent: 28,
      throttlePositionPercent: 12,
      mafGps: 3.8,
      shortTermFuelTrimBank1Percent: -2.1,
      longTermFuelTrimBank1Percent: 7.8,
      o2SensorVoltageBank1Sensor1: 0.74
    },
    troubleCodes: [
      {
        code: "P0171",
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
      {
        code: "P0302",
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
    ],
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
