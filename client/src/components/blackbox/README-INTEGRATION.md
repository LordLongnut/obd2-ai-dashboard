# Black Box Three.js frontend starter

This starter reproduces the visual structure of the supplied BLACK BOX reference:

- Three.js/R3F vehicle viewport
- wireframe pickup placeholder that requires no downloaded asset
- animated orbital rings and grid
- left navigation
- orbiting shortcut controls
- selected vehicle and system activity panels
- bottom selection/action panel
- responsive fallback layout

## 1. Install the matching React 18 packages

From `client/`:

```bash
npm install three@^0.170 @react-three/fiber@^8 @react-three/drei@^9
npm install -D @types/three@^0.170
```

The project currently uses React 18, so use React Three Fiber major version 8.

## 2. Copy the folder

Copy:

```text
client/src/components/blackbox/
```

into the same location in the repository.

## 3. Preserve the current data logic

Do not delete the existing state, effects, API calls, scanning functions, or monitoring functions in `App.tsx`.

Add:

```tsx
import { useState } from "react";
import BlackBoxDashboard, {
  type BlackBoxSection
} from "./components/blackbox/BlackBoxDashboard";
```

Inside `App()` add:

```tsx
const [activeSection, setActiveSection] = useState<BlackBoxSection>("home");
```

Replace only the existing JSX return with:

```tsx
return (
  <BlackBoxDashboard
    scan={scan}
    diagnosis={diagnosis}
    monitoringStatus={monitoringStatus}
    activeSection={activeSection}
    onSectionChange={setActiveSection}
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
    detailContent={
      <>
        {/* Place the existing panels here and conditionally render by activeSection. */}
      </>
    }
  />
);
```

## 4. Map existing panels into sections

Suggested mapping:

- `vehicles`: VehicleCard + ScanSummaryCard
- `alerts`: DtcList + FreezeFrameData + ReadinessMonitors
- `data`: LiveDataGrid + MonitoringPanel
- `ai`: SymptomInput + AiAssistantPanel + DiagnosticReport
- `reports`: ScanHistoryPanel

## 5. Replace the primitive truck later

The built-in wireframe pickup is only a dependency-free placeholder. For a proper vehicle model:

1. Put a compressed `.glb` file at `client/public/models/pickup.glb`.
2. Load it with `useGLTF("/models/pickup.glb")`.
3. Traverse its meshes once and replace their materials with a shared `MeshBasicMaterial` using `wireframe: true`.
4. Keep the GLB under roughly 3–5 MB for a quick first load.

Avoid putting the menus and text inside the Three.js canvas. Keeping them as DOM elements makes the UI responsive, selectable, accessible, and much easier to connect to existing React state.
