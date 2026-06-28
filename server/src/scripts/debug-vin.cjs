const { SerialPort } = require("serialport");

const PORT = process.env.OBD_PORT || "/dev/ttyUSB0";
const BAUD = Number(process.env.OBD_BAUD_RATE || 115200);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function sendCommand(port, command, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    let buffer = "";

    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error(`Timeout waiting for ${command}. Buffer: ${JSON.stringify(buffer)}`));
    }, timeoutMs);

    function cleanup() {
      clearTimeout(timeout);
      port.off("data", onData);
    }

    function onData(data) {
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

async function runCommand(port, command, timeoutMs = 10000) {
  try {
    const response = await sendCommand(port, command, timeoutMs);
    console.log(`\n${command}:`);
    console.log(JSON.stringify(response));
  } catch (error) {
    console.log(`\n${command}: ERROR`);
    console.log(error.message);
  }

  await sleep(500);
}

async function main() {
  const port = new SerialPort({
    path: PORT,
    baudRate: BAUD,
    autoOpen: false
  });

  await new Promise((resolve, reject) => {
    port.open((error) => {
      if (error) reject(error);
      else resolve();
    });
  });

  console.log(`Connected to ${PORT}`);

  try {
    const initCommands = [
      "ATZ",
      "ATE0",
      "ATL1",
      "ATS1",
      "ATH1",
      "ATAL",
      "ATCAF1",
      "ATSP0"
    ];

    for (const command of initCommands) {
      await runCommand(port, command, 10000);
    }

    await runCommand(port, "0100");
    await runCommand(port, "0900");
    await runCommand(port, "0902");
    await runCommand(port, "09 02");

    console.log("\n--- Trying functional CAN header 7DF ---");
    await runCommand(port, "ATSH7DF");
    await runCommand(port, "0902");

    console.log("\n--- Trying ECM physical CAN header 7E0 ---");
    await runCommand(port, "ATSH7E0");
    await runCommand(port, "0902");

    console.log("\n--- Trying receive filter 7E8 ---");
    await runCommand(port, "ATCRA7E8");
    await runCommand(port, "0902");

    console.log("\nDone.");
  } finally {
    port.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
