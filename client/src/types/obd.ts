export type MockScan = {
  vehicle: string;
  rpm: number;
  coolantTemp: number;
  shortTermFuelTrim: number;
  longTermFuelTrim: number;
  codes: string[];
};

export type AiDiagnosis = {
  summary: string;
  severity: "Low" | "Medium" | "High";
  likelyCauses: string[];
  nextSteps: string[];
};
