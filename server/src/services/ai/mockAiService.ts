type MockScan = {
  vehicle: string;
  rpm: number;
  coolantTemp: number;
  shortTermFuelTrim: number;
  longTermFuelTrim: number;
  codes: string[];
};

export function getMockDiagnosis(scan: MockScan) {
  return {
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
  };
}
