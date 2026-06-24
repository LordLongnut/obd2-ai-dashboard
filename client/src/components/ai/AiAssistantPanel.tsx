import type { AiDiagnosis } from "../../types/obd";

type AiAssistantPanelProps = {
  hasScan: boolean;
  diagnosis: AiDiagnosis | null;
  isLoading: boolean;
  onAnalyze: () => void;
};

function AiAssistantPanel({
  hasScan,
  diagnosis,
  isLoading,
  onAnalyze
}: AiAssistantPanelProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <h3 className="text-xl font-semibold mb-3">AI Diagnostic Assistant</h3>

      {!hasScan && (
        <p className="text-slate-400">
          Run a mock scan first to enable AI diagnosis.
        </p>
      )}

      {hasScan && (
        <div className="space-y-4">
          <p className="text-slate-300">
            Scan data is ready for AI analysis.
          </p>

          <button
            onClick={onAnalyze}
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-semibold"
          >
            {isLoading ? "Analyzing..." : "Analyze With AI"}
          </button>

          {diagnosis && (
            <div className="mt-5 space-y-4 border-t border-slate-800 pt-5">
              <div>
                <p className="text-slate-400">Severity</p>
                <p className="text-lg font-bold">{diagnosis.severity}</p>
              </div>

              <div>
                <p className="text-slate-400">Summary</p>
                <p className="text-slate-200">{diagnosis.summary}</p>
              </div>

              <div>
                <p className="text-slate-400 mb-2">Likely Causes</p>
                <ul className="list-disc list-inside space-y-1">
                  {diagnosis.likelyCauses.map((cause) => (
                    <li key={cause}>{cause}</li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-slate-400 mb-2">Next Diagnostic Steps</p>
                <ul className="list-disc list-inside space-y-1">
                  {diagnosis.nextSteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AiAssistantPanel;
