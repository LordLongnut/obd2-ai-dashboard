const { SerialPort } = require("serialport");

const port = new SerialPort({
  path: "/dev/ttyUSB0",
  baudRate: 115200,
  autoOpen: false,
});

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function send(command) {
  return new Promise((resolve) => {
    let response = "";

    const onData = (data) => {
      response += data.toString();
      if (response.includes(">")) {
        port.off("data", onData);
        resolve(response);
      }
    };

    port.on("data", onData);
    port.write(command + "\r");
  });
}

async function main() {
  port.open(async (err) => {
    if (err) {
      console.error("Failed to open port:", err.message);
      return;
    }

    console.log("Connected to /dev/ttyUSB0");

    const commands = [
      "ATZ",
      "ATE0",
      "ATL0",
      "ATS0",
      "ATH0",
      "ATSP0",
      "ATI",
      "0100",
      "010C",
      "0105",
    ];

    for (const cmd of commands) {
      console.log(`\n> ${cmd}`);
      const res = await send(cmd);
      console.log(res.replace(/\r/g, "\n"));
      await wait(500);
    }

    port.close();
  });
}

main();
