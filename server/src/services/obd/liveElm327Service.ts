import { SerialPort } from "serialport";

export type LiveRawObdSnapshot = {
  vin: string;
  monitorStatus: string;
  engineLoad: string;
  coolantTemp: string;
  shortTermFuelTrimBank1: string;
  longTermFuelTrimBank1: string;
  map: string;
  rpm: string;
  vehicleSpeed: string;
  intakeAirTemp: string;
  maf: string;
  throttlePosition: string;
  o2Bank1Sensor1: string;
  o2Bank1Sensor2: string;
  runTime: string;
  fuelLevel: string;
  barometricPressure: string;
  controlModuleVoltage: string;
  storedTroubleCodes: string;
  pendingTroubleCodes: string;
  permanentTroubleCodes: string;
};

const INIT_COMMANDS = ["ATZ", "ATE0", "ATL0", "ATS0", "ATH0", "ATAL", "ATSP0"];

function cleanElmResponse(command: string, raw: string): string {
  const compactCommand = command.toUpperCase().replace(/\s/g, "");

  let cleaned = raw
    .toUpperCase()
    .replace(/\r/g, "")
    .replace(/\n/g, "")
    .replace(/>/g, "")
    .replace(/\s/g, "");

  cleaned = cleaned.replace(compactCommand, "");
  cleaned = cleaned.replace(/SEARCHING\.\.\./g, "");

  return cleaned.trim();
}

function openSerialPort(port: SerialPort): Promise<void> {
  return new Promise((resolve, reject) => {
    port.open((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

function closeSerialPort(port: SerialPort): Promise<void> {
  return new Promise((resolve) => {
    if (!port.isOpen) {
      resolve();
      return;
    }

    port.close(() => resolve());
  });
}


function sendRawCommand(
  port: SerialPort,
  command: string,
  timeoutMs = 10000
): Promise<string> {
  return new Promise((resolve, reject) => {
    let buffer = "";

    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error(`Timed out waiting for raw OBD response to ${command}`));
    }, timeoutMs);

    function cleanup() {
      clearTimeout(timeout);
      port.off("data", onData);
    }

    function onData(data: Buffer) {
      buffer += data.toString("utf8");

      if (buffer.includes(">")) {
        cleanup();
        resolve(buffer);
      }
    }

    port.on("data", onData);

    port.write(`${command}\r`, (error) => {
      if (error) {
        cleanup();
        reject(error);
      }
    });
  });
}

async function readVinResponse(port: SerialPort): Promise<string> {
  try {
    await sendCommand(port, "ATL1");
    await sendCommand(port, "ATS1");
    await sendCommand(port, "ATH1");
    await sendCommand(port, "ATAL");
    await sendCommand(port, "ATCAF1");

    const vinResponse = await sendRawCommand(port, "0902", 10000);

    await sendCommand(port, "ATH0");
    await sendCommand(port, "ATL0");
    await sendCommand(port, "ATS0");

    return vinResponse;
  } catch {
    await sendCommand(port, "ATH0").catch(() => {});
    await sendCommand(port, "ATL0").catch(() => {});
    await sendCommand(port, "ATS0").catch(() => {});
    return "";
  }
}


function sendCommand(
  port: SerialPort,
  command: string,
  timeoutMs = 4000
): Promise<string> {
  return new Promise((resolve, reject) => {
    let buffer = "";

    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error(`Timed out waiting for OBD response to ${command}`));
    }, timeoutMs);

    function cleanup() {
      clearTimeout(timeout);
      port.off("data", onData);
    }

    function onData(data: Buffer) {
      buffer += data.toString("utf8");

      if (buffer.includes(">")) {
        cleanup();
        resolve(cleanElmResponse(command, buffer));
      }
    }

    port.on("data", onData);

    port.write(`${command}\r`, (error) => {
      if (error) {
        cleanup();
        reject(error);
      }
    });
  });
}

async function readOptionalPid(
  port: SerialPort,
  command: string
): Promise<string> {
  try {
    const timeout = command === "0902" ? 10000 : 4000;
    const response = await sendCommand(port, command, timeout);

    if (!response || response.includes("NODATA") || response.includes("?")) {
      return "";
    }

    return response;
  } catch {
    return "";
  }
}

export async function readLiveElm327Snapshot(): Promise<LiveRawObdSnapshot> {
  const path = process.env.OBD_PORT || "/dev/ttyUSB0";
  const baudRate = Number(process.env.OBD_BAUD_RATE || 115200);

  const port = new SerialPort({
    path,
    baudRate,
    autoOpen: false
  });

  await openSerialPort(port);

  try {
    for (const command of INIT_COMMANDS) {
      await sendCommand(port, command, 6000);
    }

    return {
      vin: await readVinResponse(port),
      monitorStatus: await readOptionalPid(port, "0101"),
      engineLoad: await readOptionalPid(port, "0104"),
      coolantTemp: await readOptionalPid(port, "0105"),
      shortTermFuelTrimBank1: await readOptionalPid(port, "0106"),
      longTermFuelTrimBank1: await readOptionalPid(port, "0107"),
      map: await readOptionalPid(port, "010B"),
      rpm: await readOptionalPid(port, "010C"),
      vehicleSpeed: await readOptionalPid(port, "010D"),
      intakeAirTemp: await readOptionalPid(port, "010F"),
      maf: await readOptionalPid(port, "0110"),
      throttlePosition: await readOptionalPid(port, "0111"),
      o2Bank1Sensor1: await readOptionalPid(port, "0114"),
      o2Bank1Sensor2: await readOptionalPid(port, "0115"),
      runTime: await readOptionalPid(port, "011F"),
      fuelLevel: await readOptionalPid(port, "012F"),
      barometricPressure: await readOptionalPid(port, "0133"),
      controlModuleVoltage: await readOptionalPid(port, "0142"),
      storedTroubleCodes: await readOptionalPid(port, "03"),
      pendingTroubleCodes: await readOptionalPid(port, "07"),
      permanentTroubleCodes: await readOptionalPid(port, "0A")
    };
  } finally {
    await closeSerialPort(port);
  }
}
