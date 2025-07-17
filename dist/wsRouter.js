"use strict";
// import { WebSocketServer } from "ws";
// import { setupBroadcast } from "./route/broadcast";
// import { setupPrivateChat } from "./route/private";
// import type { Server } from "http";
// export function setupWebSocketRoutes(server: Server) {
//   const wssBroadcast = new WebSocketServer({ noServer: true });
//   const wssPrivate = new WebSocketServer({ noServer: true });
//   server.on("upgrade", (req, socket, head) => {
//     const url = req.url || "";
//     if (url.startsWith("/ws/broadcast")) {
//       wssBroadcast.handleUpgrade(req, socket, head, (ws) => {
//         setupBroadcast(wssBroadcast, ws); // Pass WSS instance
//       });
//     } else if (url.startsWith("/ws/private")) {
//       wssPrivate.handleUpgrade(req, socket, head, (ws) => {
//         setupPrivateChat(ws);
//       });
//     } else {
//       socket.destroy();
//     }
//   });
// }
