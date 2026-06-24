type AiAssistantPanelProps = {
  hasScan: boolean;
};

function AiAssistantPanel({ hasScan }: AiAssistantPanelProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <h3 className="text-xl font-semibold mb-3">AI Diagnostic Assistant</h3>

      {hasScan ? (
        <div className="space-y-3">
          <p className="text-slate-300">
            Scan data is ready for AI analysis.
          </p>

          <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-semibold">
            Analyze With AI
          </button>
        </div>
      ) : (
        <p className="text-slate-400">
          Run a mock scan first to enable AI diagnosis.
        </p>
      )}
    </div>
  );
}

export default AiAssistantPanel;
