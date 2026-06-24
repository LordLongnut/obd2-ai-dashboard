type MockElm327Snapshot = {
  engineLoad: string;
  coolantTemp: string;
  shortTermFuelTrimBank1: string;
  longTermFuelTrimBank1: string;
  rpm: string;
  vehicleSpeed: string;
  intakeAirTemp: string;
  maf: string;
  throttlePosition: string;
  o2Bank1Sensor1: string;
  storedTroubleCodes: string;
};

const mockResponses: Record<string, string> = {
  "0104": "41 04 47",
  "0105": "41 05 83",
  "0106": "41 06 7D",
  "0107": "41 07 8A",
  "010C": "41 0C 0C D0",
  "010D": "41 0D 00",
  "010F": "41 0F 49",
  "0110": "41 10 01 7C",
  "0111": "41 11 1F",
  "0114": "41 14 94 FF",
  "03": "43 01 71 03 02 00 00"
};

export function sendMockObdCommand(command: string): string {
  const normalizedCommand = command.toUpperCase().replace(/\s/g, "");
  const response = mockResponses[normalizedCommand];

  if (!response) {
    throw new Error(`No mock OBD response configured for command ${command}`);
  }

  return response;
}

export function getMockElm327Snapshot(): MockElm327Snapshot {
  return {
    engineLoad: sendMockObdCommand("0104"),
    coolantTemp: sendMockObdCommand("0105"),
    shortTermFuelTrimBank1: sendMockObdCommand("0106"),
    longTermFuelTrimBank1: sendMockObdCommand("0107"),
    rpm: sendMockObdCommand("010C"),
    vehicleSpeed: sendMockObdCommand("010D"),
    intakeAirTemp: sendMockObdCommand("010F"),
    maf: sendMockObdCommand("0110"),
    throttlePosition: sendMockObdCommand("0111"),
    o2Bank1Sensor1: sendMockObdCommand("0114"),
    storedTroubleCodes: sendMockObdCommand("03")
  };
}
