"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ws_1 = require("ws");
const http_1 = __importDefault(require("http"));
const url_1 = __importDefault(require("url"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
// Maps to store clients
const broadcastClients = new Set();
const privateClients = new Map();
// Broadcast WebSocket Server
const broadcastWSS = new ws_1.WebSocketServer({ noServer: true });
broadcastWSS.on("connection", (ws) => {
    broadcastClients.add(ws);
    console.log("🔊 Broadcast client connected");
    ws.on("message", (msg) => {
        console.log("📢 Broadcast:", msg.toString());
        for (const client of broadcastClients) {
            if (client !== ws && client.readyState === ws.OPEN) {
                client.send(msg.toString());
            }
        }
    });
    ws.on("close", () => {
        broadcastClients.delete(ws);
        console.log("🔌 Broadcast client disconnected");
    });
});
// Private WebSocket Server
const privateWSS = new ws_1.WebSocketServer({ noServer: true });
privateWSS.on("connection", (ws, request) => {
    const { query } = url_1.default.parse(request.url, true);
    const userId = query.id;
    if (!userId) {
        ws.close();
        return;
    }
    privateClients.set(userId, ws);
    console.log(`🔐 Private client [${userId}] connected`);
    ws.on("message", (msgRaw) => {
        const msg = JSON.parse(msgRaw.toString());
        const target = msg.to;
        const text = msg.text;
        const recipient = privateClients.get(target);
        console.log("what ws recipient look like ", recipient);
        if (recipient && recipient.readyState === ws.OPEN) {
            recipient.send(JSON.stringify({ from: userId, text }));
        }
    });
    ws.on("close", () => {
        privateClients.delete(userId);
        console.log(`❌ Private client [${userId}] disconnected`);
    });
});
// Upgrade HTTP to WS
server.on("upgrade", (req, socket, head) => {
    const { pathname } = url_1.default.parse(req.url);
    if (pathname === "/ws/broadcast") {
        broadcastWSS.handleUpgrade(req, socket, head, (ws) => {
            broadcastWSS.emit("connection", ws, req);
        });
    }
    else if (pathname === "/ws/private") {
        privateWSS.handleUpgrade(req, socket, head, (ws) => {
            privateWSS.emit("connection", ws, req);
        });
    }
    else {
        socket.destroy();
    }
});
server.listen(8080, () => console.log("✅ WebSocket server running on http://localhost:8080"));
