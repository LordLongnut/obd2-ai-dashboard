function hexBytes(response: string): number[] {
  return response
    .replace(/\r/g, " ")
    .replace(/\n/g, " ")
    .split(" ")
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => parseInt(value, 16));
}

function getPidDataBytes(response: string): number[] {
  const bytes = hexBytes(response);

  if (bytes.length < 3) {
    throw new Error(`Invalid OBD response: ${response}`);
  }

  return bytes.slice(2);
}

export function parseEngineRpm(response: string): number {
  const [a, b] = getPidDataBytes(response);
  return Math.round(((a * 256) + b) / 4);
}

export function parseVehicleSpeedMph(response: string): number {
  const [a] = getPidDataBytes(response);
  const kph = a;
  return Math.round(kph * 0.621371);
}

export function parseCoolantTempF(response: string): number {
  const [a] = getPidDataBytes(response);
  const celsius = a - 40;
  return Math.round((celsius * 9) / 5 + 32);
}

export function parseIntakeAirTempF(response: string): number {
  const [a] = getPidDataBytes(response);
  const celsius = a - 40;
  return Math.round((celsius * 9) / 5 + 32);
}

export function parseEngineLoadPercent(response: string): number {
  const [a] = getPidDataBytes(response);
  return Number(((a * 100) / 255).toFixed(1));
}

export function parseThrottlePositionPercent(response: string): number {
  const [a] = getPidDataBytes(response);
  return Number(((a * 100) / 255).toFixed(1));
}

export function parseMafGps(response: string): number {
  const [a, b] = getPidDataBytes(response);
  return Number((((a * 256) + b) / 100).toFixed(2));
}

export function parseFuelTrimPercent(response: string): number {
  const [a] = getPidDataBytes(response);
  return Number((((a - 128) * 100) / 128).toFixed(1));
}

export function parseO2SensorVoltage(response: string): number {
  const [a] = getPidDataBytes(response);
  return Number((a / 200).toFixed(2));
}

export function parseDtcResponse(response: string): string[] {
  const bytes = hexBytes(response);

  const dataBytes = bytes[0] === 0x43 ? bytes.slice(1) : bytes;
  const codes: string[] = [];

  for (let i = 0; i < dataBytes.length; i += 2) {
    const a = dataBytes[i];
    const b = dataBytes[i + 1];

    if (a === undefined || b === undefined) continue;
    if (a === 0x00 && b === 0x00) continue;

    const systemMap = ["P", "C", "B", "U"];
    const system = systemMap[(a & 0xc0) >> 6];

    const firstDigit = (a & 0x30) >> 4;
    const secondDigit = a & 0x0f;
    const thirdDigit = (b & 0xf0) >> 4;
    const fourthDigit = b & 0x0f;

    const code = `${system}${firstDigit}${secondDigit.toString(16).toUpperCase()}${thirdDigit.toString(16).toUpperCase()}${fourthDigit.toString(16).toUpperCase()}`;

    codes.push(code);
  }

  return codes;
}
