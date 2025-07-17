"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupPrivate = void 0;
const ws_1 = __importDefault(require("ws"));
const url_1 = require("url");
const privateClients = new Map();
function setupPrivate(server, req, socket, head) {
    const { query } = (0, url_1.parse)(req.url || "", true);
    const id = query.id;
    if (!id) {
        socket.destroy();
        return;
    }
    const privateServer = new ws_1.default.Server({ noServer: true });
    privateServer.handleUpgrade(req, socket, head, (ws) => {
        privateServer.emit("connection", ws, req);
    });
    privateServer.on("connection", (ws) => {
        privateClients.set(id, ws);
        ws.on("message", (msg) => {
            try {
                const { to, text } = JSON.parse(msg.toString());
                const recipient = privateClients.get(to);
                if (recipient && recipient.readyState === ws_1.default.OPEN) {
                    recipient.send(`${id} → You: ${text}`);
                }
            }
            catch (_a) {
                ws.send("Invalid message format");
            }
        });
        ws.on("close", () => {
            privateClients.delete(id);
        });
    });
}
exports.setupPrivate = setupPrivate;
