"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupBroadcast = void 0;
const ws_1 = __importDefault(require("ws"));
function setupBroadcast(server, req, socket, head) {
    const broadcastServer = new ws_1.default.Server({ noServer: true });
    broadcastServer.handleUpgrade(req, socket, head, (ws) => {
        broadcastServer.emit("connection", ws, req);
    });
    broadcastServer.on("connection", (ws) => {
        ws.on("message", (msg) => {
            broadcastServer.clients.forEach((client) => {
                if (client.readyState === ws_1.default.OPEN) {
                    client.send(`${msg}`);
                }
            });
        });
    });
}
exports.setupBroadcast = setupBroadcast;
