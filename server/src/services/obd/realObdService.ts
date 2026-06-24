import type { RawObdSnapshot } from "./obdAdapterService.js";

export function getRealElm327Snapshot(): RawObdSnapshot {
  throw new Error(
    "Real OBD2 adapter mode is not implemented yet. Use OBD_ADAPTER_MODE=mock for now."
  );
}
