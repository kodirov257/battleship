import process from 'node:process';
import dotenv from 'dotenv';
import WebSocket from 'ws';

dotenv.config();

const hostname = '127.0.0.1';
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

const server = new WebSocket.Server({
  host: hostname,
  port: port,
  autoPong: true,
});

server.on('listening', (ws: WebSocket) => {
  console.log(`WebSocket server listening on ws://${hostname}:${port}/`);
});

server.on('connection', (ws: WebSocket) => {
  console.log('New WebSocket client connected');

  ws.on('message', (message: string) => {
    console.log('Received message from client: ', message);
    ws.send('Server received: ' + message);
  });

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});
