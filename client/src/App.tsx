import { useEffect, useState } from "react";

import type { AiDiagnosis, ObdScan } from "./types/obd";

import { fetchLiveObdSnapshot, fetchMockObdScan } from "./services/obdApi";
import { requestAiDiagnosis } from "./services/aiApi";
import {
  fetchScanHistory,
  saveScanRecord,
  type SavedScanRecord
} from "./services/scanApi";
import {
  fetchMonitoringStatus,
  startMonitoring,
  stopMonitoring,
  type MonitoringStatus
} from "./services/monitoringApi";

import VehicleCard from "./components/dashboard/VehicleCard";
import ScanSummaryCard from "./components/dashboard/ScanSummaryCard";
import ScanHistoryPanel from "./components/dashboard/ScanHistoryPanel";
import MonitoringPanel from "./components/dashboard/MonitoringPanel";

import LiveDataGrid from "./components/obd/LiveDataGrid";
import DtcList from "./components/obd/DtcList";
import FreezeFrameData from "./components/obd/FreezeFrameData";
import ReadinessMonitors from "./components/obd/ReadinessMonitors";

import SymptomInput from "./components/ai/SymptomInput";
import AiAssistantPanel from "./components/ai/AiAssistantPanel";
import DiagnosticReport from "./components/ai/DiagnosticReport";

import BlackBoxDashboard, {
  type BlackBoxSection
} from "./components/blackbox/BlackBoxDashboard";

type ScanSource = "simulated" | "live" | null;

type EmptyModuleProps = {
  title: string;
  message: string;
};

function EmptyModule({ title, message }: EmptyModuleProps) {
  return (
    <div className="rounded-xl border border-sky-500/20 bg-slate-950/60 p-6 text-slate-300">
      <h2 className="mb-2 text-lg font-semibold text-sky-300">{title}</h2>
      <p className="m-0 text-sm leading-6 text-slate-400">{message}</p>
    </div>
  );
}

function App() {
  const [scan, setScan] = useState<ObdScan | null>(null);
  const [scanSource, setScanSource] = useState<ScanSource>(null);
  const [symptoms, setSymptoms] = useState("");
  const [diagnosis, setDiagnosis] = useState<AiDiagnosis | null>(null);
  const [scanHistory, setScanHistory] = useState<SavedScanRecord[]>([]);
  const [monitoringStatus, setMonitoringStatus] =
    useState<MonitoringStatus | null>(null);
  const [lastSavedScanId, setLastSavedScanId] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMonitoringBusy, setIsMonitoringBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeSection, setActiveSection] =
    useState<BlackBoxSection>("home");

  async function loadScanHistory() {
    try {
      const records = await fetchScanHistory();
      setScanHistory(records);
    } catch (error) {
      console.error("Failed to load scan history:", error);
      setErrorMessage("Failed to load scan history.");
    }
  }

  async function loadMonitoringStatus() {
    try {
      const status = await fetchMonitoringStatus();
      setMonitoringStatus(status);

      if (status.latestSnapshot) {
        setScan(status.latestSnapshot);
        setScanSource("live");
      }
    } catch (error) {
      console.error("Failed to load monitoring status:", error);
    }
  }

  useEffect(() => {
    void loadMonitoringStatus();

    const interval = window.setInterval(() => {
      void loadMonitoringStatus();
    }, 5000);

    return () => window.clearInterval(interval);
  }, []);

  async function handleStartMonitoring() {
    setIsMonitoringBusy(true);
    setErrorMessage(null);
    setSaveMessage(null);

    try {
      const status = await startMonitoring(5);
      setMonitoringStatus(status);
    } catch (error) {
      console.error("Start monitoring failed:", error);
      setErrorMessage(
        "Failed to start monitoring. Check adapter connection, vehicle key position, and /dev/ttyUSB0."
      );
    } finally {
      setIsMonitoringBusy(false);
    }
  }

  async function handleStopMonitoring() {
    setIsMonitoringBusy(true);
    setErrorMessage(null);

    try {
      const status = await stopMonitoring();
      setMonitoringStatus(status);
    } catch (error) {
      console.error("Stop monitoring failed:", error);
      setErrorMessage("Failed to stop monitoring.");
    } finally {
      setIsMonitoringBusy(false);
    }
  }

  async function runSimulatedScan() {
    setIsScanning(true);
    setErrorMessage(null);
    setSaveMessage(null);

    try {
      const scanData = await fetchMockObdScan();
      setScan(scanData);
      setScanSource("simulated");
      setDiagnosis(null);
      setLastSavedScanId(null);
      setActiveSection("data");
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
    setSaveMessage(null);

    try {
      const scanData = await fetchLiveObdSnapshot();
      setScan(scanData);
      setScanSource("live");
      setDiagnosis(null);
      setLastSavedScanId(null);
      setActiveSection("data");
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
    setSaveMessage(null);

    try {
      const scanWithSymptoms: ObdScan = {
        ...scan,
        symptoms
      };

      const diagnosisData = await requestAiDiagnosis(scanWithSymptoms);
      setDiagnosis(diagnosisData);

      const savedRecord = await saveScanRecord({
        scan: scanWithSymptoms,
        diagnosis: diagnosisData,
        symptoms,
        scanSource
      });

      setLastSavedScanId(savedRecord.id);
      setSaveMessage("Scan and AI diagnosis saved to history.");
      setActiveSection("ai");

      const records = await fetchScanHistory();
      setScanHistory(records);
    } catch (error) {
      console.error("AI diagnosis or save failed:", error);
      setErrorMessage("Failed to analyze or save scan data.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  function handleSectionChange(section: BlackBoxSection) {
    setActiveSection(section);
    setErrorMessage(null);
    setSaveMessage(null);

    if (section === "trips" || section === "reports") {
      void loadScanHistory();
    }
  }

  function renderDetailContent() {
    switch (activeSection) {
      case "vehicles":
        return scan ? (
          <div className="grid gap-5">
            <ScanSummaryCard
              scan={scan}
              scanSource={scanSource}
              diagnosis={diagnosis}
            />
            <VehicleCard vehicle={scan.vehicle} />
          </div>
        ) : (
          <EmptyModule
            title="No vehicle data loaded"
            message="Run a live scan or simulated scan to identify the vehicle and display its current health information."
          />
        );

      case "trips":
        return (
          <ScanHistoryPanel
            records={scanHistory}
            onRefresh={loadScanHistory}
            lastSavedScanId={lastSavedScanId}
          />
        );

      case "alerts":
        return scan ? (
          <div className="grid gap-5">
            <DtcList troubleCodes={scan.troubleCodes} />
            <FreezeFrameData freezeFrame={scan.freezeFrame} />
            <ReadinessMonitors monitors={scan.readinessMonitors} />
          </div>
        ) : (
          <EmptyModule
            title="No alert data loaded"
            message="Run a scan before opening the alert module. Trouble codes, freeze-frame data, and readiness monitors will appear here."
          />
        );

      case "data":
        return (
          <div className="grid gap-5">
            <MonitoringPanel
              status={monitoringStatus}
              onStart={handleStartMonitoring}
              onStop={handleStopMonitoring}
              onRefresh={loadMonitoringStatus}
              isBusy={isMonitoringBusy}
            />

            {scan ? (
              <LiveDataGrid liveData={scan.liveData} />
            ) : (
              <EmptyModule
                title="No live data loaded"
                message="Start monitoring or run a scan to populate the live OBD-II data grid."
              />
            )}
          </div>
        );

      case "ai":
        return (
          <div className="grid gap-5">
            {scan ? (
              <>
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
        );

      case "reports":
        return (
          <div className="grid gap-5">
            {scan && (
              <ScanSummaryCard
                scan={scan}
                scanSource={scanSource}
                diagnosis={diagnosis}
              />
            )}

            <ScanHistoryPanel
              records={scanHistory}
              onRefresh={loadScanHistory}
              lastSavedScanId={lastSavedScanId}
            />
          </div>
        );

      case "settings":
        return (
          <div className="grid gap-5">
            <MonitoringPanel
              status={monitoringStatus}
              onStart={handleStartMonitoring}
              onStop={handleStopMonitoring}
              onRefresh={loadMonitoringStatus}
              isBusy={isMonitoringBusy}
            />

            <EmptyModule
              title="Logger configuration"
              message="Vehicle assignment, upload behavior, sampling intervals, and CAN logging options can be added to this module as those settings are exposed by the backend."
            />
          </div>
        );

      case "home":
      default:
        return null;
    }
  }

  const dashboardMonitoringStatus = monitoringStatus
    ? {
        isEnabled: monitoringStatus.isRunning,
        lastProbeAt: monitoringStatus.lastSampleAt
      }
    : null;

  return (
    <BlackBoxDashboard
      scan={scan}
      diagnosis={diagnosis}
      monitoringStatus={dashboardMonitoringStatus}
      activeSection={activeSection}
      onSectionChange={handleSectionChange}
      onRunLiveScan={runLiveScan}
      onRunSimulatedScan={runSimulatedScan}
      onAnalyze={analyzeWithAi}
      onStartMonitoring={handleStartMonitoring}
      onStopMonitoring={handleStopMonitoring}
      isScanning={isScanning}
      isAnalyzing={isAnalyzing}
      isMonitoringBusy={isMonitoringBusy}
      errorMessage={errorMessage}
      saveMessage={saveMessage}
      detailContent={renderDetailContent()}
    />
  );
}

export default App;