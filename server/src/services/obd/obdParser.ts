function hexBytes(response: string): number[] {
  const compact = response
    .toUpperCase()
    .replace(/SEARCHING\.\.\./g, "")
    .replace(/NO DATA/g, "")
    .replace(/OK/g, "")
    .replace(/>/g, "")
    .replace(/[^0-9A-F]/g, "");

  if (!compact || compact.length < 2) {
    return [];
  }

  const evenLengthCompact =
    compact.length % 2 === 0 ? compact : compact.slice(0, -1);

  const pairs = evenLengthCompact.match(/.{1,2}/g) || [];

  return pairs.map((pair) => parseInt(pair, 16));
}

function getPidDataBytes(response: string, pid: number): number[] {
  const bytes = hexBytes(response);

  const responseIndex = bytes.findIndex((byte, index) => {
    return byte === 0x41 && bytes[index + 1] === pid;
  });

  if (responseIndex === -1) {
    throw new Error(`Could not find PID response 41 ${pid.toString(16)} in: ${response}`);
  }

  return bytes.slice(responseIndex + 2);
}

export function parseEngineRpm(response: string): number {
  const [a, b] = getPidDataBytes(response, 0x0c);
  return Math.round(((a * 256) + b) / 4);
}

export function parseVehicleSpeedMph(response: string): number {
  const [a] = getPidDataBytes(response, 0x0d);
  return Math.round(a * 0.621371);
}

export function parseCoolantTempF(response: string): number {
  const [a] = getPidDataBytes(response, 0x05);
  const celsius = a - 40;
  return Math.round((celsius * 9) / 5 + 32);
}

export function parseIntakeAirTempF(response: string): number {
  const [a] = getPidDataBytes(response, 0x0f);
  const celsius = a - 40;
  return Math.round((celsius * 9) / 5 + 32);
}

export function parseEngineLoadPercent(response: string): number {
  const [a] = getPidDataBytes(response, 0x04);
  return Number(((a * 100) / 255).toFixed(1));
}

export function parseThrottlePositionPercent(response: string): number {
  const [a] = getPidDataBytes(response, 0x11);
  return Number(((a * 100) / 255).toFixed(1));
}

export function parseMafGps(response: string): number {
  const [a, b] = getPidDataBytes(response, 0x10);
  return Number((((a * 256) + b) / 100).toFixed(2));
}

export function parseFuelTrimPercent(response: string, pid: 0x06 | 0x07): number {
  const [a] = getPidDataBytes(response, pid);
  return Number((((a - 128) * 100) / 128).toFixed(1));
}

export function parseMapKpa(response: string): number {
  const [a] = getPidDataBytes(response, 0x0b);
  return a;
}

export function parseO2SensorVoltage(response: string): number {
  const [a] = getPidDataBytes(response, 0x14);
  return Number((a / 200).toFixed(2));
}

export function parseDtcResponse(response: string): string[] {
  const bytes = hexBytes(response);

  const responseIndex = bytes.findIndex((byte) => byte === 0x43);

  if (responseIndex === -1) {
    return [];
  }

  const dataBytes = bytes.slice(responseIndex + 1);
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

    codes.push(
      `${system}${firstDigit}${secondDigit.toString(16).toUpperCase()}${thirdDigit.toString(16).toUpperCase()}${fourthDigit.toString(16).toUpperCase()}`
    );
  }

  return codes;
}
