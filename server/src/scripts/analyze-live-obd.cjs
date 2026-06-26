const { SerialPort } = require("serialport");
require("dotenv").config();

const port = new SerialPort({
  path: "/dev/ttyUSB0",
  baudRate: 115200,
  autoOpen: false,
});

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

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

function send(command, timeoutMs = 4000) {
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
  const index = clean.indexOf("410C");
  if (index === -1) return null;

  const data = clean.slice(index + 4);
  const a = parseInt(data.slice(0, 2), 16);
  const b = parseInt(data.slice(2, 4), 16);

  return Math.round(((a * 256) + b) / 4);
}

function parseCoolantTemp(response) {
  const clean = cleanResponse(response);
  const index = clean.indexOf("4105");
  if (index === -1) return null;

  const data = clean.slice(index + 4);
  const a = parseInt(data.slice(0, 2), 16);

  const celsius = a - 40;
  const fahrenheit = Math.round((celsius * 9) / 5 + 32);

  return { celsius, fahrenheit };
}

function parseVehicleSpeed(response) {
  const clean = cleanResponse(response);
  const index = clean.indexOf("410D");
  if (index === -1) return null;

  const data = clean.slice(index + 4);
  const kph = parseInt(data.slice(0, 2), 16);
  const mph = Math.round(kph * 0.621371);

  return { kph, mph };
}

function parseThrottlePosition(response) {
  const clean = cleanResponse(response);
  const index = clean.indexOf("4111");
  if (index === -1) return null;

  const data = clean.slice(index + 4);
  const a = parseInt(data.slice(0, 2), 16);

  return Math.round((a * 100) / 255);
}

async function initializeAdapter() {
  const initCommands = ["ATZ", "ATE0", "ATL0", "ATS0", "ATH0", "ATSP0"];

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

  return {
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
}

async function analyzeWithAI(snapshot) {
  if (!OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY in your server/.env file.");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are an automotive diagnostic assistant. Analyze OBD-II data like a technician. Be practical, cautious, and do not overstate certainty. Separate normal observations from possible concerns. Recommend the next useful diagnostic data to collect.",
        },
        {
          role: "user",
          content: `Analyze this live OBD-II snapshot:\n\n${JSON.stringify(
            snapshot,
            null,
            2
          )}`,
        },
      ],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(JSON.stringify(data, null, 2));
  }

  return data.choices[0].message.content;
}

async function main() {
  port.open(async (err) => {
    if (err) {
      console.error("Failed to open port:", err.message);
      return;
    }

    try {
      console.log("Connected to /dev/ttyUSB0");

      await initializeAdapter();

      const snapshot = await readSnapshot();

      console.log("\nLive OBD-II Snapshot:");
      console.log(JSON.stringify(snapshot, null, 2));

      console.log("\nSending snapshot to AI...\n");

      const analysis = await analyzeWithAI(snapshot);

      console.log("AI Analysis:");
      console.log(analysis);
    } catch (error) {
      console.error("\nError:");
      console.error(error.message);
    } finally {
      port.close(() => {
        console.log("\nPort closed.");
      });
    }
  });
}

main();
