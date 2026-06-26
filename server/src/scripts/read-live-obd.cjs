const { SerialPort } = require("serialport");

const port = new SerialPort({
  path: "/dev/ttyUSB0",
  baudRate: 115200,
  autoOpen: false,
});

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cleanResponse(raw) {
  return raw
    .replace(/\r/g, "")
    .replace(/\n/g, "")
    .replace(/>/g, "")
    .replace(/SEARCHING\.\.\./g, "")
    .replace(/\s/g, "")
    .trim()
    .toUpperCase();
}

function send(command, timeoutMs = 3000) {
  return new Promise((resolve) => {
    let response = "";

    const onData = (data) => {
      response += data.toString("utf8");

      if (response.includes(">")) {
        cleanup();
        resolve(response);
      }
    };

    const cleanup = () => {
      clearTimeout(timer);
      port.off("data", onData);
    };

    const timer = setTimeout(() => {
      cleanup();
      resolve(response || "[NO RESPONSE]");
    }, timeoutMs);

    port.on("data", onData);
    port.write(command + "\r");
  });
}

async function sendPid(command, retries = 2) {
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    const raw = await send(command, 4000);
    const clean = cleanResponse(raw);

    const badResponse =
      clean.includes("STOPPED") ||
      clean.includes("NODATA") ||
      clean.includes("UNABLETOCONNECT") ||
      clean.includes("CANERROR") ||
      clean.includes("BUSINIT") ||
      clean === "";

    if (!badResponse) {
      return raw;
    }

    console.log(`Retrying ${command} after bad response: ${clean}`);
    await wait(700);
  }

  return "[NO VALID RESPONSE]";
}

function parseRPM(response) {
  const clean = cleanResponse(response);

  // Expected: 410C A B
  const index = clean.indexOf("410C");
  if (index === -1) return null;

  const data = clean.slice(index + 4);
  const a = parseInt(data.slice(0, 2), 16);
  const b = parseInt(data.slice(2, 4), 16);

  return Math.round(((a * 256) + b) / 4);
}

function parseCoolantTemp(response) {
  const clean = cleanResponse(response);

  // Expected: 4105 A
  const index = clean.indexOf("4105");
  if (index === -1) return null;

  const data = clean.slice(index + 4);
  const a = parseInt(data.slice(0, 2), 16);

  const celsius = a - 40;
  const fahrenheit = Math.round((celsius * 9) / 5 + 32);

  return {
    celsius,
    fahrenheit,
  };
}

function parseVehicleSpeed(response) {
  const clean = cleanResponse(response);

  // Expected: 410D A
  const index = clean.indexOf("410D");
  if (index === -1) return null;

  const data = clean.slice(index + 4);
  const kph = parseInt(data.slice(0, 2), 16);
  const mph = Math.round(kph * 0.621371);

  return {
    kph,
    mph,
  };
}

function parseThrottlePosition(response) {
  const clean = cleanResponse(response);

  // Expected: 4111 A
  const index = clean.indexOf("4111");
  if (index === -1) return null;

  const data = clean.slice(index + 4);
  const a = parseInt(data.slice(0, 2), 16);

  return Math.round((a * 100) / 255);
}

async function initializeAdapter() {
  const initCommands = [
    "ATZ",   // reset
    "ATE0",  // echo off
    "ATL0",  // linefeeds off
    "ATS0",  // spaces off
    "ATH0",  // headers off
    "ATSP0", // automatic protocol
  ];

  for (const cmd of initCommands) {
    const res = await send(cmd);
    console.log(`${cmd}: ${cleanResponse(res)}`);
    await wait(300);
  }
}

async function readSnapshot() {
  const rpmRaw = await sendPid("010C");
  await wait(300);

  const coolantRaw = await sendPid("0105");
  await wait(300);

  const speedRaw = await sendPid("010D");
  await wait(300);

  const throttleRaw = await sendPid("0111");
  await wait(300);

  const coolant = parseCoolantTemp(coolantRaw);
  const speed = parseVehicleSpeed(speedRaw);

  const snapshot = {
    timestamp: new Date().toISOString(),
    rpm: parseRPM(rpmRaw),
    coolantTempC: coolant?.celsius ?? null,
    coolantTempF: coolant?.fahrenheit ?? null,
    speedKph: speed?.kph ?? null,
    speedMph: speed?.mph ?? null,
    throttlePositionPercent: parseThrottlePosition(throttleRaw),
    raw: {
      rpm: cleanResponse(rpmRaw),
      coolant: cleanResponse(coolantRaw),
      speed: cleanResponse(speedRaw),
      throttle: cleanResponse(throttleRaw),
    },
  };

  console.log("\nVehicle Snapshot:");
  console.log(JSON.stringify(snapshot, null, 2));
}

async function main() {
  port.open(async (err) => {
    if (err) {
      console.error("Failed to open port:", err.message);
      return;
    }

    console.log("Connected to /dev/ttyUSB0");

    await initializeAdapter();
    await readSnapshot();

    port.close(() => {
      console.log("\nPort closed.");
    });
  });
}

main();