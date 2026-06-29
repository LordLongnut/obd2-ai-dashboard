import type { Request, Response } from "express";
import {
  getMonitoringSamples,
  getMonitoringStatus,
  startMonitoring,
  stopMonitoring
} from "../services/monitoring/monitoringService.js";

export async function startMonitoringSession(req: Request, res: Response) {
  try {
    const intervalSeconds = Number(req.body?.intervalSeconds || 5);
    const status = await startMonitoring(intervalSeconds);

    res.json(status);
  } catch (error) {
    console.error("Start monitoring failed:", error);

    res.status(500).json({
      message: "Failed to start monitoring",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}

export async function stopMonitoringSession(_req: Request, res: Response) {
  try {
    const status = await stopMonitoring();
    res.json(status);
  } catch (error) {
    console.error("Stop monitoring failed:", error);

    res.status(500).json({
      message: "Failed to stop monitoring",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}

export async function readMonitoringStatus(_req: Request, res: Response) {
  res.json(getMonitoringStatus());
}

export async function readMonitoringSamples(req: Request, res: Response) {
  try {
    const limit = Number(req.query.limit || 50);
    const samples = await getMonitoringSamples(limit);

    res.json(samples);
  } catch (error) {
    console.error("Read monitoring samples failed:", error);

    res.status(500).json({
      message: "Failed to read monitoring samples",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
