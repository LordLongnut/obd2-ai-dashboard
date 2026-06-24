import type { MockScan } from "../../types/obd";

type LiveDataGridProps = {
  scan: MockScan;
};

function LiveDataGrid({ scan }: LiveDataGridProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <h3 className="text-xl font-semibold mb-4">Live Data</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-slate-400">RPM</p>
          <p className="text-2xl font-bold">{scan.rpm}</p>
        </div>

        <div>
          <p className="text-slate-400">Coolant Temp</p>
          <p className="text-2xl font-bold">{scan.coolantTemp}°F</p>
        </div>

        <div>
          <p className="text-slate-400">Short Term Fuel Trim</p>
          <p className="text-2xl font-bold">{scan.shortTermFuelTrim}%</p>
        </div>

        <div>
          <p className="text-slate-400">Long Term Fuel Trim</p>
          <p className="text-2xl font-bold">{scan.longTermFuelTrim}%</p>
        </div>
      </div>
    </div>
  );
}

export default LiveDataGrid;
