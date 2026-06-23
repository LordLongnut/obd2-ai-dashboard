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

export default app;
