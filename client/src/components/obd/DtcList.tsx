type DtcListProps = {
  codes: string[];
};

function DtcList({ codes }: DtcListProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <h3 className="text-xl font-semibold mb-3">Trouble Codes</h3>

      {codes.length === 0 ? (
        <p className="text-slate-400">No diagnostic trouble codes found.</p>
      ) : (
        <ul className="space-y-2">
          {codes.map((code) => (
            <li
              key={code}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 font-mono"
            >
              {code}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default DtcList;
