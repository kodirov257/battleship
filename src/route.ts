import WebSocket from 'ws';

import { AuthController } from './controllers/auth-controller';
import { Container } from './framework/container';
import { parseRequest } from './utils';
import { ScoreController } from './controllers/score-controller';
import { setAllMiddlewares } from './config/middlewares';
import { RoomController } from './controllers/room-controller';
import { User } from './models/user';
import { connections } from './config/users';
import { Room } from './models/room';
import { GameController } from './controllers/game-controller';
import {Game} from "./models/game";

const wsRoutes: { [key: string]: { middlewares: string[] } } = {
  reg: { middlewares: [] },
  create_room: { middlewares: ['auth'] },
  add_user_to_room: { middlewares: ['auth'] },
  add_ships: { middlewares: ['auth'] },
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
  const req: { user?: User; body?: any } = {};
  await middleware.handle({ req: req, socket: ws });
  console.log(req);

  const scoreController = Container.getInstance().get<ScoreController>(
    ScoreController.name,
  );
  const roomController = Container.getInstance().get<RoomController>(
    RoomController.name,
  );

  type Multicast = {
    client: WebSocket;
    result: { type: string; data: any; id: number };
  }[];

  const result: {
    result?: { type: string; data: any; id: number };
    broadcast?: { type: string; data: any; id: number }[];
    multicast?: Multicast;
  } = {};
  let authController = null;
  const broadcast = [],
    multicast: Multicast = [];
  let rooms, winners, room: Room, game: Game;
  try {
    switch (data.type) {
      case 'reg':
        authController = Container.getInstance().get<AuthController>(
          AuthController.name,
        );
        const authResult = authController.register(data.data, ws);

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

        result.result = {
          type: data.type,
          data: JSON.stringify(authResult),
          id: data.id,
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
        break;

      case 'add_user_to_room':
        room = roomController.addUserToRoom(req, data.data.indexRoom);

        rooms = roomController.getAvailableRooms();
        broadcast.push({
          type: UPDATE_ROOM,
          data: JSON.stringify(rooms),
          id: data.id,
        });

        if (!room.isAvailable()) {
          game = room.getGame()!;
          room.getUsers().forEach((userId: string) => {
            connections.forEach((user: User, ws) => {
              if (user.id === userId) {
                multicast.push({
                  client: ws,
                  result: {
                    type: 'create_game',
                    data: JSON.stringify({
                      idGame: game.getId(),
                      idPlayer: userId,
                    }),
                    id: data.id,
                  },
                });
              }
            });
          });
        }

        result.result = {
          type: data.type,
          data: '',
          id: data.id,
        };
        break;

      case 'add_ships':
        req.body = data.data;

        const gameController = Container.getInstance().get<GameController>(
          GameController.name,
        );
        game = gameController.addShips(req);

        if (game.isReady()) {
          const readyGame = gameController.startGame(req, game.getId());
          game.getPlayers().forEach((userId: string) => {
            connections.forEach((user: User, ws) => {
              if (user.id === userId) {
                multicast.push({
                  client: ws,
                  result: {
                    type: 'start_game',
                    data: JSON.stringify(readyGame),
                    id: data.id,
                  },
                });

                multicast.push({
                  client: ws,
                  result: {
                    type: 'turn',
                    data: JSON.stringify({
                      currentPlayer: readyGame.currentPlayerIndex,
                    }),
                    id: data.id,
                  },
                });
              }
            });
          });


        }

        break;
    }

    result.broadcast = broadcast;
    result.multicast = multicast;

    return result;
  } catch (e) {
    throw e;
  }
};

export default {
  wsHandler,
};
