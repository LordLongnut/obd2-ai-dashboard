import type { ReadinessMonitors as ReadinessMonitorsType } from "../../types/obd";

type ReadinessMonitorsProps = {
  monitors: ReadinessMonitorsType;
};

function ReadinessMonitors({ monitors }: ReadinessMonitorsProps) {
  const items = [
    { label: "Catalyst", value: monitors.catalyst },
    { label: "EVAP System", value: monitors.evaporativeSystem },
    { label: "Oxygen Sensor", value: monitors.oxygenSensor },
    { label: "O2 Sensor Heater", value: monitors.oxygenSensorHeater },
    { label: "EGR System", value: monitors.egrSystem }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <h3 className="text-xl font-semibold mb-4">Readiness Monitors</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="bg-slate-950 border border-slate-800 rounded-lg p-3"
          >
            <p className="text-slate-400 text-sm">{item.label}</p>
            <p className="font-semibold">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ReadinessMonitors;
