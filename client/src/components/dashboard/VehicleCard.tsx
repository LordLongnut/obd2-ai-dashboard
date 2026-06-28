import type { VehicleInfo } from "../../types/obd";

type VehicleCardProps = {
  vehicle: VehicleInfo;
};

function VehicleCard({ vehicle }: VehicleCardProps) {
  const isLivePlaceholder =
    vehicle.year === 0 || vehicle.make === "Live";

  if (isLivePlaceholder) {
    const hasVin = vehicle.vin && vehicle.vin !== "UNKNOWN";

    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h2 className="text-2xl font-semibold">Live OBD-II Vehicle</h2>

        <p className="text-slate-400 mt-2">
          Live scan data is being read directly from the OBD-II adapter.
        </p>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-slate-500">Adapter</p>
            <p className="text-slate-200 font-semibold">OBDLink EX</p>
          </div>

          <div>
            <p className="text-slate-500">Port</p>
            <p className="text-slate-200 font-mono">/dev/ttyUSB0</p>
          </div>

          <div>
            <p className="text-slate-500">VIN</p>
            <p className="text-slate-200 font-mono">
              {hasVin ? vehicle.vin : "Not available"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <h2 className="text-2xl font-semibold">
        {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.engine}
      </h2>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <p className="text-slate-400">
          VIN: <span className="text-slate-200 font-mono">{vehicle.vin}</span>
        </p>

        <p className="text-slate-400">
          Mileage:{" "}
          <span className="text-slate-200">
            {vehicle.mileage.toLocaleString()} miles
          </span>
        </p>
      </div>
    </div>
  );
}

export default VehicleCard;
