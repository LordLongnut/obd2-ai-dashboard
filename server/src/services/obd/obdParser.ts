function hexBytes(response: string): number[] {
  const compact = response
    .toUpperCase()
    .replace(/SEARCHING\.\.\./g, "")
    .replace(/NO DATA/g, "")
    .replace(/OK/g, "")
    .replace(/>/g, "")
    .replace(/[^0-9A-F]/g, "");

  if (!compact || compact.length < 2) return [];

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
    throw new Error(
      `Could not find PID response 41 ${pid.toString(16)} in: ${response}`
    );
  }

  return bytes.slice(responseIndex + 2);
}

export function parseVinResponse(response: string): string {
  const lines = response
    .toUpperCase()
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.includes(">"));

  const payloadBytes: number[] = [];

  for (const line of lines) {
    const tokens = line
      .split(/\s+/)
      .map((token) => token.trim())
      .filter(Boolean);

    // Example VIN response with headers:
    // 7E8 10 14 49 02 01 59 56 34
    // 7E8 21 39 30 32 44 5A 36 45
    // 7E8 22 32 35 34 32 36 39 32

    const withoutHeader =
      tokens[0]?.length === 3 && /^[0-9A-F]{3}$/.test(tokens[0])
        ? tokens.slice(1)
        : tokens;

    const bytes = withoutHeader
      .filter((token) => /^[0-9A-F]{2}$/.test(token))
      .map((token) => parseInt(token, 16));

    if (bytes.length === 0) continue;

    const firstByte = bytes[0];

    // First ISO-TP frame: 10 14 [payload...]
    if ((firstByte & 0xf0) === 0x10) {
      payloadBytes.push(...bytes.slice(2));
      continue;
    }

    // Consecutive ISO-TP frame: 21 [payload...], 22 [payload...]
    if ((firstByte & 0xf0) === 0x20) {
      payloadBytes.push(...bytes.slice(1));
      continue;
    }

    // Single-frame or already-clean response
    payloadBytes.push(...bytes);
  }

  let vinDataStart = payloadBytes.findIndex((byte, index) => {
    return byte === 0x49 && payloadBytes[index + 1] === 0x02;
  });

  if (vinDataStart === -1) {
    const fallbackBytes = hexBytes(response);
    vinDataStart = fallbackBytes.findIndex((byte, index) => {
      return byte === 0x49 && fallbackBytes[index + 1] === 0x02;
    });

    if (vinDataStart === -1) return "UNKNOWN";

    const fallbackVinBytes = fallbackBytes
      .slice(vinDataStart + 3)
      .filter((byte) => byte >= 0x30 && byte <= 0x5a);

    const fallbackVinText = String.fromCharCode(...fallbackVinBytes)
      .replace(/[^A-HJ-NPR-Z0-9]/g, "")
      .trim();

    const fallbackMatch = fallbackVinText.match(/[A-HJ-NPR-Z0-9]{17}/);
    return fallbackMatch ? fallbackMatch[0] : "UNKNOWN";
  }

  const vinBytes = payloadBytes
    .slice(vinDataStart + 3)
    .filter((byte) => byte >= 0x30 && byte <= 0x5a);

  const vinText = String.fromCharCode(...vinBytes)
    .replace(/[^A-HJ-NPR-Z0-9]/g, "")
    .trim();

  const vinMatch = vinText.match(/[A-HJ-NPR-Z0-9]{17}/);

  return vinMatch ? vinMatch[0] : "UNKNOWN";
}

export function parseMonitorStatus(response: string) {
  const [a] = getPidDataBytes(response, 0x01);

  return {
    milOn: (a & 0x80) !== 0,
    storedCodeCount: a & 0x7f
  };
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

export function parseO2SensorVoltage(response: string, pid: 0x14 | 0x15): number {
  const [a] = getPidDataBytes(response, pid);
  return Number((a / 200).toFixed(2));
}

export function parseRunTimeSeconds(response: string): number {
  const [a, b] = getPidDataBytes(response, 0x1f);
  return (a * 256) + b;
}

export function parseFuelLevelPercent(response: string): number {
  const [a] = getPidDataBytes(response, 0x2f);
  return Number(((a * 100) / 255).toFixed(1));
}

export function parseBarometricPressureKpa(response: string): number {
  const [a] = getPidDataBytes(response, 0x33);
  return a;
}

export function parseControlModuleVoltage(response: string): number {
  const [a, b] = getPidDataBytes(response, 0x42);
  return Number((((a * 256) + b) / 1000).toFixed(2));
}

export function parseDtcResponse(
  response: string,
  responseServiceByte: 0x43 | 0x47 | 0x4a = 0x43
): string[] {
  const bytes = hexBytes(response);

  const responseIndex = bytes.findIndex((byte) => byte === responseServiceByte);

  if (responseIndex === -1) return [];

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
      `${system}${firstDigit}${secondDigit
        .toString(16)
        .toUpperCase()}${thirdDigit.toString(16).toUpperCase()}${fourthDigit
        .toString(16)
        .toUpperCase()}`
    );
  }

  return codes;
}
