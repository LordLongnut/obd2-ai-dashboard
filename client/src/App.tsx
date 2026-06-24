import { useState } from "react";
import axios from "axios";

import type { MockScan } from "./types/obd";
import VehicleCard from "./components/dashboard/VehicleCard";
import LiveDataGrid from "./components/obd/LiveDataGrid";
import DtcList from "./components/obd/DtcList";
import AiAssistantPanel from "./components/ai/AiAssistantPanel";

function App() {
  const [scan, setScan] = useState<MockScan | null>(null);

  async function runMockScan() {
    const response = await axios.get("http://localhost:5000/api/obd/mock-scan");
    setScan(response.data);
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
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold mb-8"
        >
          Run Mock Scan
        </button>

        <div className="grid gap-5">
          {scan ? (
            <>
              <VehicleCard vehicle={scan.vehicle} />
              <LiveDataGrid scan={scan} />
              <DtcList codes={scan.codes} />
              <AiAssistantPanel hasScan={true} />
            </>
          ) : (
            <AiAssistantPanel hasScan={false} />
          )}
        </div>
      </section>
    </main>
  );
}

export default App;
