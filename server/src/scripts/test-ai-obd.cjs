const snapshot = {
  timestamp: "2026-06-26T17:32:30.421Z",
  rpm: 721,
  coolantTempC: 71,
  coolantTempF: 160,
  speedKph: 0,
  speedMph: 0,
  throttlePositionPercent: 15,
};

console.log("Send this to your AI analyze route:");
console.log(JSON.stringify(snapshot, null, 2));
