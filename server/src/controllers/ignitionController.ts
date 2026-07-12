import type { Request, Response } from "express";
import {
  getIgnitionWatchStatus,
  startIgnitionWatch,
  stopIgnitionWatch
} from "../services/ignition/ignitionWatchService.js";

export async function startIgnitionWatchController(req: Request, res: Response) {
  try {
    const status = await startIgnitionWatch({
      probeIntervalSeconds: Number(req.body?.probeIntervalSeconds || 10),
      monitoringIntervalSeconds: Number(req.body?.monitoringIntervalSeconds || 5),
      postShutdownLoggingSeconds: Number(req.body?.postShutdownLoggingSeconds || 180)
    });

    res.json(status);
  } catch (error) {
    console.error("Start ignition watch failed:", error);

    res.status(500).json({
      message: "Failed to start ignition watch",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}

export async function stopIgnitionWatchController(_req: Request, res: Response) {
  try {
    const status = await stopIgnitionWatch();
    res.json(status);
  } catch (error) {
    console.error("Stop ignition watch failed:", error);

    res.status(500).json({
      message: "Failed to stop ignition watch",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}

export function readIgnitionWatchStatus(_req: Request, res: Response) {
  res.json(getIgnitionWatchStatus());
}
