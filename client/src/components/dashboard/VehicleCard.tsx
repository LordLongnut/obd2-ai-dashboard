type VehicleCardProps = {
  vehicle: string;
};

function VehicleCard({ vehicle }: VehicleCardProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <h2 className="text-2xl font-semibold">{vehicle}</h2>
      <p className="text-slate-400 mt-2">
        Active diagnostic scan session
      </p>
    </div>
  );
}

export default VehicleCard;
