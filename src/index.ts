import process from 'node:process';
import dotenv from 'dotenv';
import WebSocket from 'ws';

import './config/dependencies';
import route from './route';
import { AuthError } from './exceptions/auth-error';

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

server.on('connection', async (ws: WebSocket) => {
  console.log('New WebSocket client connected');

  ws.on('message', async (message: string) => {
    try {
      console.log(message.toString());
      const result = await route.wsHandler(message, ws);

      if (result.result) {
        ws.send(JSON.stringify(result.result));
      }

      if (result.broadcast.length > 0) {
        result.broadcast.forEach((broadcast: any) => {
          server.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(broadcast));
            }
          });
        });
      }
    } catch (e) {
      if (e instanceof AuthError) {
        ws.send(e.message);
      } else {
        console.error('Message error: ', e);
        ws.send('Server error: ' + e);
      }
    }
  });

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});
