import express from "express";
import { WebSocketServer } from "ws";
import http from "http";
import url from "url";

const app = express();
const server = http.createServer(app);

// Maps to store clients
const broadcastClients = new Set<WebSocket>();
const privateClients = new Map<string, WebSocket>();

// Broadcast WebSocket Server
const broadcastWSS = new WebSocketServer({ noServer: true });
broadcastWSS.on("connection", (ws: any) => {
  broadcastClients.add(ws);
  console.log("🔊 Broadcast client connected");

  ws.on("message", (msg: any) => {
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
const privateWSS = new WebSocketServer({ noServer: true });
privateWSS.on("connection", (ws, request) => {
  const { query } = url.parse(request.url!, true);
  const userId = query.id as string;

  if (!userId) {
    ws.close();
    return;
  }

  privateClients.set(userId, ws as any);
  console.log(`🔐 Private client [${userId}] connected`);

  ws.on("message", (msgRaw) => {
    const msg = JSON.parse(msgRaw.toString());
    const target = msg.to;
    const text = msg.text;

    const recipient = privateClients.get(target);
    console.log("what ws recipient look like ", recipient)
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
  const { pathname } = url.parse(req.url!);
  if (pathname === "/ws/broadcast") {
    broadcastWSS.handleUpgrade(req, socket, head, (ws) => {
      broadcastWSS.emit("connection", ws, req);
    });
  } else if (pathname === "/ws/private") {
    privateWSS.handleUpgrade(req, socket, head, (ws) => {
      privateWSS.emit("connection", ws, req);
    });
  } else {
    socket.destroy();
  }
});

server.listen(8080, () =>
  console.log("✅ WebSocket server running on http://localhost:8080")
);
