import type { TroubleCode } from "../../types/obd";

type DtcListProps = {
  troubleCodes: TroubleCode[];
};

function DtcList({ troubleCodes }: DtcListProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <h3 className="text-xl font-semibold mb-3">Fault Codes</h3>

      {troubleCodes.length === 0 ? (
        <p className="text-slate-400">No stored, pending, or permanent fault codes found.</p>
      ) : (
        <div className="space-y-3">
          {troubleCodes.map((dtc, index) => (
            <div
              key={`${dtc.status}-${dtc.code}-${index}`}
              className="bg-slate-950 border border-slate-800 rounded-lg p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-mono text-lg">{dtc.code}</p>

                  {dtc.status && (
                    <span className="text-xs bg-blue-500/10 text-blue-300 border border-blue-500/20 rounded-full px-3 py-1">
                      {dtc.status}
                    </span>
                  )}
                </div>

                <span className="text-xs bg-yellow-500/10 text-yellow-300 border border-yellow-500/20 rounded-full px-3 py-1">
                  {dtc.severity}
                </span>
              </div>

              <p className="mt-2 font-semibold">{dtc.description}</p>
              <p className="text-slate-400 text-sm">{dtc.system}</p>

              <div className="mt-3">
                <p className="text-slate-400 text-sm mb-1">Possible causes:</p>
                <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                  {dtc.possibleCauses.map((cause) => (
                    <li key={cause}>{cause}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DtcList;
