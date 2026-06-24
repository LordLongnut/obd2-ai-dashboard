import type { ObdScan } from "../../types/obd.js";

export function buildDiagnosisPrompt(scan: ObdScan): string {
  const vehicle = `${scan.vehicle.year} ${scan.vehicle.make} ${scan.vehicle.model} ${scan.vehicle.engine}`;

  const troubleCodesText = scan.troubleCodes
    .map((dtc) => {
      return `
- ${dtc.code}: ${dtc.description}
  System: ${dtc.system}
  Severity: ${dtc.severity}
  Possible causes: ${dtc.possibleCauses.join(", ")}`;
    })
    .join("\n");

  return `
You are an automotive diagnostic assistant helping a technician interpret OBD2 scan data.

Vehicle:
${vehicle}
VIN: ${scan.vehicle.vin}
Mileage: ${scan.vehicle.mileage}

Live Data:
- RPM: ${scan.liveData.rpm}
- Vehicle Speed: ${scan.liveData.vehicleSpeedMph} mph
- Coolant Temp: ${scan.liveData.coolantTempF}°F
- Intake Air Temp: ${scan.liveData.intakeAirTempF}°F
- Engine Load: ${scan.liveData.engineLoadPercent}%
- Throttle Position: ${scan.liveData.throttlePositionPercent}%
- MAF: ${scan.liveData.mafGps} g/s
- Short Term Fuel Trim Bank 1: ${scan.liveData.shortTermFuelTrimBank1Percent}%
- Long Term Fuel Trim Bank 1: ${scan.liveData.longTermFuelTrimBank1Percent}%
- O2 Sensor B1S1 Voltage: ${scan.liveData.o2SensorVoltageBank1Sensor1} V

Trouble Codes:
${troubleCodesText}

Freeze Frame:
- RPM: ${scan.freezeFrame.rpm}
- Vehicle Speed: ${scan.freezeFrame.vehicleSpeedMph} mph
- Coolant Temp: ${scan.freezeFrame.coolantTempF}°F
- Engine Load: ${scan.freezeFrame.engineLoadPercent}%
- Fuel Trim Bank 1: ${scan.freezeFrame.fuelTrimBank1Percent}%

Readiness Monitors:
- Catalyst: ${scan.readinessMonitors.catalyst}
- EVAP System: ${scan.readinessMonitors.evaporativeSystem}
- Oxygen Sensor: ${scan.readinessMonitors.oxygenSensor}
- Oxygen Sensor Heater: ${scan.readinessMonitors.oxygenSensorHeater}
- EGR System: ${scan.readinessMonitors.egrSystem}

Return a diagnosis with:
1. A plain-English summary
2. Overall severity
3. Most likely causes
4. Diagnostic steps in the order a technician should perform them
5. Things not to replace blindly
`;
}
