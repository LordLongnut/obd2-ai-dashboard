import type { VehicleInfo } from "../../types/obd";

type VehicleCardProps = {
  vehicle: VehicleInfo;
};

function VehicleCard({ vehicle }: VehicleCardProps) {
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
