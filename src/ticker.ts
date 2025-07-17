import express from "express";
import http from "http";
import WebSocket, { WebSocketServer } from "ws"; // ✅ Avoid name conflict

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server }); // ✅ Use WebSocketServer, not WebSocket

const TICKERS = ["AAPL", "GOOG", "TSLA", "MSFT", "AMZN", "NFLX"] as const;
type TickerSymbol = typeof TICKERS[number];

type Prices = Record<TickerSymbol, number>;

let prices: Prices = TICKERS.reduce((all, t) => {
  return { ...all, [t]: 100 + Math.random() * 400 };
}, {} as Prices);

function randomPriceMove(price: number): number {
  return +(price + (Math.random() - 0.5) * 2).toFixed(2);
}

setInterval(() => {
  TICKERS.forEach(ticker => {
    prices[ticker] = randomPriceMove(prices[ticker]);
  });

  const update = {
    type: "ticker",
    data: TICKERS.map(t => ({ symbol: t, price: prices[t] }))
  };

  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(update));
    }
  });
}, 1000);

wss.on("connection", ws => {
  ws.send(
    JSON.stringify({
      type: "Top 5 Ticker",
      data: TICKERS.map(t => ({ symbol: t, price: prices[t] }))
    })
  );

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

server.listen(8080, () => {
  console.log("Listening on port 8080");
});
