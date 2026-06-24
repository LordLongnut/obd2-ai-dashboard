import type { FreezeFrameData as FreezeFrameDataType } from "../../types/obd";

type FreezeFrameDataProps = {
  freezeFrame: FreezeFrameDataType;
};

function FreezeFrameData({ freezeFrame }: FreezeFrameDataProps) {
  const items = [
    { label: "RPM", value: freezeFrame.rpm },
    { label: "Vehicle Speed", value: `${freezeFrame.vehicleSpeedMph} mph` },
    { label: "Coolant Temp", value: `${freezeFrame.coolantTempF}°F` },
    { label: "Engine Load", value: `${freezeFrame.engineLoadPercent}%` },
    { label: "Fuel Trim Bank 1", value: `${freezeFrame.fuelTrimBank1Percent}%` }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <h3 className="text-xl font-semibold mb-4">Freeze Frame Data</h3>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.label}>
            <p className="text-slate-400">{item.label}</p>
            <p className="text-xl font-bold">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FreezeFrameData;
