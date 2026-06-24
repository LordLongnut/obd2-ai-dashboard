import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "OBD2 AI Dashboard API is running" });
});

app.get("/api/obd/mock-scan", (_req, res) => {
  res.json({
    vehicle: "2015 Audi Q5 2.0T",
    rpm: 820,
    coolantTemp: 196,
    shortTermFuelTrim: -2.1,
    longTermFuelTrim: 7.8,
    codes: ["P0171", "P0302"]
  });
});

app.post("/api/ai/diagnose", (req, res) => {
  const scan = req.body;

  res.json({
    summary:
      `${scan.vehicle} is showing a lean condition with a cylinder 2 misfire. Based on the fuel trim numbers and stored codes, this could point toward unmetered air, a fuel delivery issue, or an ignition problem on cylinder 2.`,
    severity: "Medium",
    likelyCauses: [
      "Vacuum leak or intake air leak",
      "Dirty or inaccurate mass airflow sensor",
      "Weak fuel pressure",
      "Cylinder 2 ignition coil or spark plug issue",
      "Injector issue on cylinder 2"
    ],
    nextSteps: [
      "Smoke test the intake system for vacuum leaks",
      "Check fuel trims at idle and under load",
      "Inspect spark plug and ignition coil on cylinder 2",
      "Verify fuel pressure under load",
      "Check MAF sensor readings against expected values"
    ]
  });
});

export default app;
