import { useState } from "react";

import type { AiDiagnosis, ObdScan } from "./types/obd";
import { fetchLiveObdSnapshot, fetchMockObdScan } from "./services/obdApi";
import { requestAiDiagnosis } from "./services/aiApi";

import VehicleCard from "./components/dashboard/VehicleCard";
import ScanSummaryCard from "./components/dashboard/ScanSummaryCard";
import LiveDataGrid from "./components/obd/LiveDataGrid";
import DtcList from "./components/obd/DtcList";
import FreezeFrameData from "./components/obd/FreezeFrameData";
import ReadinessMonitors from "./components/obd/ReadinessMonitors";
import SymptomInput from "./components/ai/SymptomInput";
import AiAssistantPanel from "./components/ai/AiAssistantPanel";
import DiagnosticReport from "./components/ai/DiagnosticReport";

type ScanSource = "simulated" | "live" | null;

function App() {
  const [scan, setScan] = useState<ObdScan | null>(null);
  const [scanSource, setScanSource] = useState<ScanSource>(null);
  const [symptoms, setSymptoms] = useState("");
  const [diagnosis, setDiagnosis] = useState<AiDiagnosis | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function runSimulatedScan() {
    setIsScanning(true);
    setErrorMessage(null);

    try {
      const scanData = await fetchMockObdScan();
      setScan(scanData);
      setScanSource("simulated");
      setDiagnosis(null);
    } catch (error) {
      console.error("Simulated scan failed:", error);
      setErrorMessage("Failed to fetch simulated OBD-II scan data.");
    } finally {
      setIsScanning(false);
    }
  }

  async function runLiveScan() {
    setIsScanning(true);
    setErrorMessage(null);

    try {
      const scanData = await fetchLiveObdSnapshot();
      setScan(scanData);
      setScanSource("live");
      setDiagnosis(null);
    } catch (error) {
      console.error("Live scan failed:", error);
      setErrorMessage(
        "Failed to read live OBD-II data. Check that the adapter is plugged in, the key is on, and /dev/ttyUSB0 is available."
      );
    } finally {
      setIsScanning(false);
    }
  }

  async function analyzeWithAi() {
    if (!scan) return;

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const scanWithSymptoms: ObdScan = {
        ...scan,
        symptoms
      };

      const diagnosisData = await requestAiDiagnosis(scanWithSymptoms);
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

        <div className="flex flex-wrap gap-3 mb-5">
          <button
            onClick={runSimulatedScan}
            disabled={isScanning}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-semibold"
          >
            {isScanning ? "Scanning..." : "Run Simulated Scan"}
          </button>

          <button
            onClick={runLiveScan}
            disabled={isScanning}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-900 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-semibold"
          >
            {isScanning ? "Scanning..." : "Run Live Scan"}
          </button>
        </div>

        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-200 rounded-xl p-4 mb-5">
            {errorMessage}
          </div>
        )}

        <div className="grid gap-5">
          {scan ? (
            <>
              <ScanSummaryCard
                scan={scan}
                scanSource={scanSource}
                diagnosis={diagnosis}
              />
              <VehicleCard vehicle={scan.vehicle} />
              <LiveDataGrid liveData={scan.liveData} />
              <DtcList troubleCodes={scan.troubleCodes} />
              <FreezeFrameData freezeFrame={scan.freezeFrame} />
              <ReadinessMonitors monitors={scan.readinessMonitors} />
              <SymptomInput value={symptoms} onChange={setSymptoms} />
              <AiAssistantPanel
                hasScan={true}
                diagnosis={diagnosis}
                isLoading={isAnalyzing}
                onAnalyze={analyzeWithAi}
              />

              {diagnosis && (
                <DiagnosticReport
                  scan={scan}
                  diagnosis={diagnosis}
                  symptoms={symptoms}
                  scanSource={scanSource}
                />
              )}
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
