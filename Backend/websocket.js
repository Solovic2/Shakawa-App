const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 9099 });
module.exports = wss