const WebSocket = require("ws");
const ws_port = process.env.WEBSOCKET_PORT;
const wss = new WebSocket.Server({ port: ws_port });
module.exports = wss