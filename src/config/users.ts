import WebSocket from 'ws';

import { User } from '../models/user';

export const connections = new Map<WebSocket, User>();
