import {
  Ship,
  Direction as ShipDirection,
  Type as ShipType,
} from '../models/ship';
import { GameRepository } from '../repositories/game-repository';
import { ShipRepository } from '../repositories/ship-repository';
import { Board, Game } from '../models/game';

export class GameService {
  private repository: GameRepository;
  private shipRepository: ShipRepository;

  constructor(repository: GameRepository, shipRepository: ShipRepository) {
    this.repository = repository;
    this.shipRepository = shipRepository;
  }

  public create(
    roomId: string,
    firstPlayerId: string,
    secondPlayerId: string,
  ): Game {
    return this.repository.create(roomId, firstPlayerId, secondPlayerId);
  }

  public getGame(id: string): Game {
    const game = this.repository.find(id);

    if (!game) {
      throw new Error('Game not found');
    }

    return game;
  }

  public addShip(
    game: Game,
    playerId: string,
    x: number,
    y: number,
    direction: ShipDirection,
    length: number,
    type: ShipType,
  ): Ship {
    if (length < 0 || length > Game.BOARD_SIZE) {
      throw new Error('Invalid length');
    }

    if (
      !this.isWithinBoard(x, y) ||
      !this.isWithinBoard(
        direction === 'horizontal' ? x + length - 1 : x,
        direction === 'horizontal' ? y : y + length - 1,
      )
    ) {
      throw new Error('Invalid position');
    }

    const ship = this.shipRepository.create(
      game.getId(),
      x,
      y,
      direction,
      length,
      type,
    );

    game.setShip(playerId, ship);
    this.repository.update(game);

    return ship;
  }

  public fillBoard(game: Game, playerId: string, ship: Ship): Game {
    console.log('Fill board, ship_id: ', playerId);
    const board = game.getBoard(playerId);
    if (!board || board.length !== 10) {
      throw new Error('Board is not valid');
    }

    if (
        !this.canPlaceShip(
            board,
            ship.getX(),
            ship.getY(),
            ship.getLength(),
            ship.getDirection(),
        )
    ) {
      throw new Error('Board is not valid');
    }

    for (let i = 0; i < ship.getLength(); i++) {
      let horizontal = 0,
        vertical = 0;
      if (ship.getDirection() === 'horizontal') {
        horizontal = ship.getY();
        vertical = ship.getX() + i;
      } else {
        horizontal = ship.getY() + i;
        vertical = ship.getX();
      }

      board[horizontal]![vertical] = ship.getId();
    }

    // console.log('Fill board, board: ', board);

    return game;
  }

  public canPlaceShip(
    board: Board,
    x: number,
    y: number,
    length: number,
    direction: ShipDirection,
  ): boolean {
    const checkDirections = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ];
    const shipCells: [number, number][] = [];

    for (let i = 0; i < length; i++) {
      let horizontal = 0,
        vertical = 0;
      if (direction === 'horizontal') {
        horizontal = y;
        vertical = x + i;
      } else {
        horizontal = y + i;
        vertical = x;
      }
      shipCells.push([horizontal, vertical]);
    }

    for (const [cy, cx] of shipCells) {
      for (const [dy, dx] of checkDirections.concat([[0, 0]])) {
        const ny = cy + dy!;
        const nx = cx + dx!;
        if (this.isWithinBoard(nx, ny) && board[ny]?.[nx] !== 0) {
          return false;
        }
      }
    }

    return true;
  }

  public hit(game: Game, playerId: string, x: number, y: number) {
    const board = game.getBoard(playerId);
    if (!board) {
      throw new Error('Board not found');
    }

    if (!board[y]) {
      throw new Error('Board is not filled');
    }

    if (board[y][x] === -1 || board[y][x] === -2) {
      throw new Error('Already hit');
    }

    let hit = false;
    if (board[y][x] !== 0 && typeof board[y][x] === 'string') {
      board[y][x] = -2;
      hit = true;
    } else {
      board[y][x] = -1;
    }

    game.setBoard(playerId, board);
    this.repository.update(game);

    return hit;
  }

  public ifShipDestroyed(
    game: Game,
    playerId: string,
    x: number,
    y: number,
  ): void {
    const board = game.getBoard(playerId);
    if (!board) {
      throw new Error('Board not found');
    }

    if (!board[y]) {
      throw new Error('Board is not filled');
    }

    if (
      board[y][x] === 0 ||
      board[y][x] === -1 ||
      typeof board[y][x] !== 'string'
    ) {
      throw new Error('Ship is not destroyed');
    }

    const shipId = board[y][x];
    const ship = game.getShip(playerId, shipId);

    if (!ship) {
      throw new Error('Ship not found');
    }

    let hitLength = 0;
    for (let i = 0; i < ship.getLength(); i++) {
      let horizontal = 0;
      let vertical = 0;

      if (ship.getDirection() === 'horizontal') {
        horizontal = y;
        vertical = x + i;
      } else {
        horizontal = y + i;
        vertical = x;
      }

      const row = board[horizontal];
      if (!row || !row[vertical]) {
        throw new Error('Board is not filled');
      }

      if (row[vertical] === -2) {
        hitLength++;
      }
    }

    if (hitLength === ship.getLength()) {
      ship.destroy();
    }

    game.setShip(playerId, ship);
    this.repository.update(game);
  }

  public ifPlayerWinner(game: Game, playerId: string): boolean {
    const ships = game.getShips(playerId);
    if (!ships) {
      throw new Error('Ships not found');
    }

    for (const [_, ship] of Object.entries(ships)) {
      if (!ship.isDestroyed()) {
        return false;
      }
    }

    game.setWinner(playerId);
    this.repository.update(game);

    return true;
  }

  private isWithinBoard(x: number, y: number): boolean {
    return x >= 0 && x < Game.BOARD_SIZE && y >= 0 && y < Game.BOARD_SIZE;
  }
}
