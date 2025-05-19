import { GameService } from '../services/game-service';
import { Direction as ShipDirection, Type as ShipType } from '../models/ship';
import { Game } from 'models/game';

type ShipTypeDef = {
  position: { x: number; y: number };
  direction: ShipDirection;
  length: number;
  type: ShipType;
}[];

export class GameController {
  private service: GameService;

  constructor(service: GameService) {
    this.service = service;
  }

  public create(
    req: any,
    roomId: string,
    firstPlayerId: string,
    secondPlayerId: string,
  ) {
    const game = this.service.create(roomId, firstPlayerId, secondPlayerId);

    return {
      idGame: game.getId(),
      idPlayer: req.user.id,
    };
  }

  public addShips(req: any): Game {
    try {
      const data: { gameId: string; ships: ShipTypeDef; indexPlayer: string } =
          {
            gameId: req.body.gameId,
            ships: req.body.ships.map((ship: any) => ({
              position: {
                x: ship.position.x,
                y: ship.position.y,
              },
              direction: !ship.direction ? 'horizontal' : 'vertical',
              length: ship.length,
              type: ship.type,
            })),
            indexPlayer: req.body.indexPlayer,
          };

      this.validateShips(data.ships);

      const playerId = data.indexPlayer ?? req.user.id;
      console.log('Add ships, player_id: ', playerId);
      let game = this.service.getGame(data.gameId);

      for (let i = 0; i < data.ships.length; i++) {
        const tempShip = data.ships[i];
        const ship = this.service.addShip(
          game,
          playerId,
          tempShip!.position.x,
          tempShip!.position.y,
          tempShip!.direction,
          tempShip!.length,
          tempShip!.type,
        );
        game = this.service.fillBoard(game, playerId, ship);
      }

      return game;
    } catch (e) {
      throw e;
    }
  }

  public startGame(req: any, gameId: string) {
    const game = this.service.getGame(gameId);
    const ships = [];
    const playerId = req.body.indexPlayer ?? req.user.id;

    for (const ship of Object.values(game.getShips(playerId)!)) {
      ships.push({
        position: {
          x: ship.getX(),
          y: ship.getY(),
        },
        direction: ship.getDirection(),
        length: ship.getLength(),
        type: ship.getType(),
      });
    }

    return {
      ships: ships,
      currentPlayerIndex: playerId,
    };
  }

  private validateShips(ships: ShipTypeDef): void {
    const counter = {
      small: 0,
      medium: 0,
      large: 0,
      huge: 0,
    };

    for (const ship of ships) {
      counter[ship.type] += 1;
    }

    if (
      counter.small < 4 ||
      counter.medium < 3 ||
      counter.large < 2 ||
      counter.huge < 1
    ) {
      throw new Error('Invalid ships');
    }
  }
}
