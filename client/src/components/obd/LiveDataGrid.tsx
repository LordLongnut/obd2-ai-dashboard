import type { LiveData } from "../../types/obd";

type LiveDataGridProps = {
  liveData: LiveData;
};

type LiveDataItem = {
  label: string;
  value: string | number;
};

function addOptionalNumber(
  items: LiveDataItem[],
  label: string,
  value: number | undefined,
  suffix = ""
) {
  if (typeof value === "number") {
    items.push({ label, value: `${value}${suffix}` });
  }
}

function LiveDataGrid({ liveData }: LiveDataGridProps) {
  const items: LiveDataItem[] = [
    { label: "RPM", value: liveData.rpm },
    { label: "Vehicle Speed", value: `${liveData.vehicleSpeedMph} mph` },
    { label: "Coolant Temp", value: `${liveData.coolantTempF}°F` },
    { label: "Intake Air Temp", value: `${liveData.intakeAirTempF}°F` },
    { label: "Engine Load", value: `${liveData.engineLoadPercent}%` },
    { label: "Throttle Position", value: `${liveData.throttlePositionPercent}%` },
    { label: "MAF", value: `${liveData.mafGps} g/s` },
    {
      label: "STFT Bank 1",
      value: `${liveData.shortTermFuelTrimBank1Percent}%`
    },
    {
      label: "LTFT Bank 1",
      value: `${liveData.longTermFuelTrimBank1Percent}%`
    },
    {
      label: "O2 B1S1",
      value: `${liveData.o2SensorVoltageBank1Sensor1} V`
    }
  ];

  addOptionalNumber(items, "MAP", liveData.mapKpa, " kPa");
  addOptionalNumber(items, "O2 B1S2", liveData.o2SensorVoltageBank1Sensor2, " V");
  addOptionalNumber(items, "Fuel Level", liveData.fuelLevelPercent, "%");
  addOptionalNumber(items, "Baro Pressure", liveData.barometricPressureKpa, " kPa");
  addOptionalNumber(
    items,
    "Control Module Voltage",
    liveData.controlModuleVoltage,
    " V"
  );
  addOptionalNumber(items, "Engine Runtime", liveData.runTimeSeconds, " sec");

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <h3 className="text-xl font-semibold mb-4">Live Data</h3>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.label}>
            <p className="text-slate-400">{item.label}</p>
            <p className="text-2xl font-bold">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LiveDataGrid;
