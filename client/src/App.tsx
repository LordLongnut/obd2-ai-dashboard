import { useState } from "react";
import axios from "axios";

type MockScan = {
  vehicle: string;
  rpm: number;
  coolantTemp: number;
  shortTermFuelTrim: number;
  longTermFuelTrim: number;
  codes: string[];
};

function App() {
  const [scan, setScan] = useState<MockScan | null>(null);

  async function runMockScan() {
    const response = await axios.get("http://localhost:5000/api/obd/mock-scan");
    setScan(response.data);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <section className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">OBD2 AI Dashboard</h1>
        <p className="text-slate-400 mb-6">
          Full-stack automotive diagnostic dashboard prototype.
        </p>

        <button
          onClick={runMockScan}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold"
        >
          Run Mock Scan
        </button>

        {scan && (
          <div className="mt-8 grid gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h2 className="text-2xl font-semibold mb-4">{scan.vehicle}</h2>

              <div className="grid grid-cols-2 gap-4">
                <p>RPM: {scan.rpm}</p>
                <p>Coolant Temp: {scan.coolantTemp}°F</p>
                <p>STFT: {scan.shortTermFuelTrim}%</p>
                <p>LTFT: {scan.longTermFuelTrim}%</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-xl font-semibold mb-3">Trouble Codes</h3>
              <ul className="list-disc list-inside">
                {scan.codes.map((code) => (
                  <li key={code}>{code}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
