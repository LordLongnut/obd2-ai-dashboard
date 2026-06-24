import { useState } from "react";

import type { AiDiagnosis, ObdScan } from "./types/obd";
import { fetchMockObdScan } from "./services/obdApi";
import { requestAiDiagnosis } from "./services/aiApi";

import VehicleCard from "./components/dashboard/VehicleCard";
import LiveDataGrid from "./components/obd/LiveDataGrid";
import DtcList from "./components/obd/DtcList";
import FreezeFrameData from "./components/obd/FreezeFrameData";
import ReadinessMonitors from "./components/obd/ReadinessMonitors";
import AiAssistantPanel from "./components/ai/AiAssistantPanel";

function App() {
  const [scan, setScan] = useState<ObdScan | null>(null);
  const [diagnosis, setDiagnosis] = useState<AiDiagnosis | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function runMockScan() {
    setIsScanning(true);
    setErrorMessage(null);

    try {
      const scanData = await fetchMockObdScan();
      setScan(scanData);
      setDiagnosis(null);
    } catch (error) {
      console.error("Mock scan failed:", error);
      setErrorMessage("Failed to fetch mock OBD2 scan data.");
    } finally {
      setIsScanning(false);
    }
  }

  async function analyzeWithAi() {
    if (!scan) return;

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const diagnosisData = await requestAiDiagnosis(scan);
      setDiagnosis(diagnosisData);
    } catch (error) {
      console.error("AI diagnosis failed:", error);
      setErrorMessage("Failed to analyze scan data.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <section className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">OBD2 AI Dashboard</h1>
          <p className="text-slate-400">
            Full-stack automotive diagnostic dashboard prototype.
          </p>
        </div>

        <button
          onClick={runMockScan}
          disabled={isScanning}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-semibold mb-8"
        >
          {isScanning ? "Scanning..." : "Run Mock Scan"}
        </button>

        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-200 rounded-xl p-4 mb-5">
            {errorMessage}
          </div>
        )}

        <div className="grid gap-5">
          {scan ? (
            <>
              <VehicleCard vehicle={scan.vehicle} />
              <LiveDataGrid liveData={scan.liveData} />
              <DtcList troubleCodes={scan.troubleCodes} />
              <FreezeFrameData freezeFrame={scan.freezeFrame} />
              <ReadinessMonitors monitors={scan.readinessMonitors} />
              <AiAssistantPanel
                hasScan={true}
                diagnosis={diagnosis}
                isLoading={isAnalyzing}
                onAnalyze={analyzeWithAi}
              />
            </>
          ) : (
            <AiAssistantPanel
              hasScan={false}
              diagnosis={null}
              isLoading={false}
              onAnalyze={analyzeWithAi}
            />
          )}
        </div>
      </section>
    </main>
  );
}

export default App;
