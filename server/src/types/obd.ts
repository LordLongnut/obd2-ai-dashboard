export type Severity = "Low" | "Medium" | "High";

export type VehicleInfo = {
  year: number;
  make: string;
  model: string;
  engine: string;
  vin: string;
  mileage: number;
};

export type LiveData = {
  rpm: number;
  vehicleSpeedMph: number;
  coolantTempF: number;
  intakeAirTempF: number;
  engineLoadPercent: number;
  throttlePositionPercent: number;
  mafGps: number;
  shortTermFuelTrimBank1Percent: number;
  longTermFuelTrimBank1Percent: number;
  o2SensorVoltageBank1Sensor1: number;
};

export type TroubleCode = {
  code: string;
  description: string;
  system: string;
  severity: Severity;
  possibleCauses: string[];
};

export type FreezeFrameData = {
  rpm: number;
  vehicleSpeedMph: number;
  coolantTempF: number;
  engineLoadPercent: number;
  fuelTrimBank1Percent: number;
};

export type ReadinessMonitors = {
  catalyst: "Ready" | "Not Ready";
  evaporativeSystem: "Ready" | "Not Ready";
  oxygenSensor: "Ready" | "Not Ready";
  oxygenSensorHeater: "Ready" | "Not Ready";
  egrSystem: "Ready" | "Not Ready";
};

export type ObdScan = {
  id: string;
  createdAt: string;
  vehicle: VehicleInfo;
  liveData: LiveData;
  troubleCodes: TroubleCode[];
  freezeFrame: FreezeFrameData;
  readinessMonitors: ReadinessMonitors;
};
