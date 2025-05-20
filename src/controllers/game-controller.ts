import { GameService } from '../services/game-service';
import { Direction as ShipDirection, Type as ShipType } from '../models/ship';
import {AttackStatus, Game} from 'models/game';
import {ScoreService} from "../services/score-service";

type ShipTypeDef = {
  position: { x: number; y: number };
  direction: ShipDirection;
  length: number;
  type: ShipType;
}[];

export class GameController {
  private service: GameService;
  private scoreService: ScoreService;

  constructor(service: GameService, scoreService: ScoreService) {
    this.service = service;
    this.scoreService = scoreService;
  }

  public getGame(req: any) {
    return this.service.getGame(req.body.gameId);
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

      if (game.isReady()) {
        game = this.service.setTurn(game, playerId);
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
        direction: ship.getDirection() === 'vertical',
        length: ship.getLength(),
        type: ship.getType(),
      });
    }

    return {
      ships: ships,
      currentPlayerIndex: playerId,
    };
  }

  public addTurn(req: any) {
    const game = this.service.getGame(req.body.gameId);
    const playerId = game.getOpponentId(req.body.indexPlayer);

    return {
      currentPlayer: playerId,
    };
  }

  public getTurn(req: any) {
    const game = this.service.getGame(req.body.gameId);

    return {
      currentPlayer: game.getTurn(),
    };
  }

  public attack(req: any) {
    const data = req.body;

    try {
      const game = this.service.getGame(data.gameId);

      if (game.getTurn() !== data.indexPlayer) {
        throw new Error('Invalid turn');
      }

      let attackStatus: AttackStatus = 'miss';
      const { hit, shipId } = this.service.attackByPosition(game, data.indexPlayer, data.x, data.y);
      if (hit) {
        attackStatus = 'shot';

        if (this.service.isShipDestroyed(game, data.indexPlayer, shipId!)) {
          attackStatus = 'killed';

          // this.service.destroyAround(game, data.indexPlayer, shipId!);
        }

        if (this.service.ifPlayerWinner(game, data.indexPlayer)) {
          this.scoreService.addWinner(req.user.id);
        }
      } else {
        this.service.setTurn(game, game.getOpponentId(data.indexPlayer));
      }

      return {
        position: {
          x: data.x,
          y: data.y,
        },
        currentPlayer: data.indexPlayer,
        status: attackStatus,
      };
    } catch (e) {
      throw e;
    }
  }

  public attackRandomly(req: any) {
    const data = req.body;

    try {
      const game = this.service.getGame(data.gameId);

      if (game.getTurn() !== data.indexPlayer) {
        throw new Error('Invalid turn');
      }

      let attackStatus: AttackStatus = 'miss';
      const {x, y} = this.service.getRandomPosition(game, data.indexPlayer);
      const { hit, shipId } = this.service.attackByPosition(game, data.indexPlayer, x, y);
      if (hit) {
        attackStatus = 'shot';

        if (this.service.isShipDestroyed(game, data.indexPlayer, shipId!)) {
          attackStatus = 'killed';

          // this.service.destroyAround(game, data.indexPlayer, shipId!);
        }

        if (this.service.ifPlayerWinner(game, data.indexPlayer)) {
          this.scoreService.addWinner(req.user.id);
        }
      } else {
        this.service.setTurn(game, game.getOpponentId(data.indexPlayer));
      }

      return {
        position: {
          x: x,
          y: y,
        },
        currentPlayer: data.indexPlayer,
        status: attackStatus,
      };
    } catch (e) {
      throw e;
    }
  }

  public checkWinner(req: any) {
    const game = this.service.getGame(req.body.gameId);

    if (game.getWinner()) {
      return {
        winPlayer: game.getWinner(),
      };
    }

    return {
      winPlayer: false,
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
