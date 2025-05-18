import WebSocket from 'ws';

import { AuthController } from './controllers/auth-controller';
import { Container } from './framework/container';
import { parseRequest } from './utils';
import { ScoreController } from './controllers/score-controller';
import { setAllMiddlewares } from './config/middlewares';
import { RoomController } from './controllers/room-controller';

const wsRoutes: { [key: string]: { middlewares: string[] } } = {
  reg: { middlewares: [] },
  create_room: { middlewares: ['auth'] },
  add_user_to_room: { middlewares: ['auth'] },
};

const UPDATE_ROOM = 'update_room';
const UPDATE_WINNERS = 'update_winners';

const wsHandler = async (request: string, ws: WebSocket): Promise<any> => {
  const data = parseRequest(request);

  const routeKeys = Object.keys(wsRoutes);
  if (!routeKeys.includes(data.type)) {
    throw new Error('Invalid request type');
  }
  const route = wsRoutes[data.type];
  if (!route) {
    throw new Error('Invalid request type');
  }
  const middleware = setAllMiddlewares(route.middlewares);
  const req = {};
  await middleware.handle({ req: req, socket: ws });

  const scoreController = Container.getInstance().get<ScoreController>(
    ScoreController.name,
  );
  const roomController = Container.getInstance().get<RoomController>(
    RoomController.name,
  );

  let result = {};
  let authController = null;
  const broadcast = [];
  let rooms, winners;
  try {
    switch (data.type) {
      case 'reg':
        authController = Container.getInstance().get<AuthController>(
          AuthController.name,
        );
        result = authController.register(data.data, ws);

        winners = scoreController.getWinners();
        broadcast.push({
          type: UPDATE_WINNERS,
          data: JSON.stringify(winners),
          id: data.id,
        });

        rooms = roomController.getAvailableRooms();
        broadcast.push({
          type: UPDATE_ROOM,
          data: JSON.stringify(rooms),
          id: data.id,
        });

        result = {
          result: {
            type: data.type,
            data: JSON.stringify(result),
            id: data.id,
          },
          broadcast,
        };
        break;

      case 'create_room':
        roomController.create(req);

        rooms = roomController.getAvailableRooms();
        broadcast.push({
          type: UPDATE_ROOM,
          data: JSON.stringify(rooms),
          id: data.id,
        });

        result = {
          broadcast,
        };
        break;

      case 'add_user_to_room':
        roomController.addUserToRoom(req, data.data.indexRoom);

        rooms = roomController.getAvailableRooms();
        broadcast.push({
          type: UPDATE_ROOM,
          data: JSON.stringify(rooms),
          id: data.id,
        });

        result = {
          result: {
            type: data.type,
            data: '',
            id: data.id,
          },
          broadcast,
        };
        break;
    }

    return result;
  } catch (e) {
    throw e;
  }
};

export default {
  wsHandler,
};
