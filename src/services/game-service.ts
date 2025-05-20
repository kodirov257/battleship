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
    const board = this.getBoard(game, playerId);
    if (board.length !== 10) {
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

  public setTurn(game: Game, playerId: string): Game {
    game.setTurn(playerId);
    this.repository.update(game);
    return game;
  }

  public getRandomPosition(game: Game, playerId: string) {
    const opponentId = game.getOpponentId(playerId);
    const board = this.getBoard(game, opponentId);
    if (!board) {
      throw new Error('Board not found');
    }

    for (let i = 0; i < Game.BOARD_SIZE; i++) {
      for (let j = 0; j < Game.BOARD_SIZE; j++) {
        if (board[i]![j] === 0) {
          return {
            x: i,
            y: j,
          };
        }
      }
    }

    return {x: -1, y: -1};
  }

  public attackRandomly(game: Game, playerId: string) {
    const opponentId = game.getOpponentId(playerId);
    const board = this.getBoard(game, opponentId);
    if (!board) {
      throw new Error('Board not found');
    }

    for (let i = 0; i < Game.BOARD_SIZE; i++) {
      for (let j = 0; j < Game.BOARD_SIZE; j++) {
        if (board[i]![j] === 0) {
          return this.attack(game, opponentId, board, i, j);
        }
      }
    }

    throw new Error('Board is not filled');
  }

  public attackByPosition(game: Game, playerId: string, x: number, y: number) {
    const opponentId = game.getOpponentId(playerId);
    const board = this.getBoard(game, opponentId);
    if (!board) {
      throw new Error('Board not found');
    }

    return this.attack(game, opponentId, board, x, y);
  }

  public attack(game: Game, opponentId: string, board: Board, x: number, y: number) {
    if (!board[y]) {
      throw new Error('Board is not filled');
    }

    if (board[y][x] === -1) {
      throw new Error('Already missed');
    } else if (board[y][x] === -2) {
      throw new Error('Already hit');
    }

    let hit = false, shipId = undefined;
    if (typeof board[y][x] === 'string') {
      shipId = board[y][x];
      board[y][x] = -2;
      hit = true;
    } else {
      board[y][x] = -1;
    }

    game.setBoard(opponentId, board);
    this.repository.update(game);

    return {hit, shipId};
  }

  public isShipDestroyed(
    game: Game,
    playerId: string,
    shipId: string,
  ): boolean {
    const opponentId = game.getOpponentId(playerId);
    const board = this.getBoard(game, opponentId);

    const ship = game.getShip(opponentId, shipId);
    if (!ship) {
      throw new Error('Ship not found');
    }

    const x = ship.getX();
    const y = ship.getY();

    if (!board[y]) {
      throw new Error('Board is not filled');
    }

    if (board[y][x] === 0 || board[y][x] === -1 || board[y][x] !== -2) {
      return false;
    }

    let destroyed = false;
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
      game.setShip(opponentId, ship);
      this.repository.update(game);

      destroyed = true;
    }

    return destroyed;
  }

  public destroyAround(
      game: Game,
      playerId: string,
      shipId: string,
  ): Board {
    const opponentId = game.getOpponentId(playerId);
    const board = this.getBoard(game, playerId);

    const ship = game.getShip(opponentId, shipId);
    if (!ship) {
      throw new Error('Ship not found');
    }

    const x = ship.getX();
    const y = ship.getY();

    if (!board[y]) {
      throw new Error('Board is not filled');
    }

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

    const length = ship.getLength();
    const direction = ship.getDirection();

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
        if (this.isWithinBoard(nx, ny)) {
          board[ny]![nx] = -1;
        }
      }
    }

    game.setBoard(opponentId, board);
    this.repository.update(game);

    return board;
  }

  public ifPlayerWinner(game: Game, playerId: string): boolean {
    const opponentId = game.getOpponentId(playerId);
    const ships = game.getShips(opponentId);
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

  private getBoard(game: Game, playerId: string): Board {
    const board = game.getBoard(playerId);

    if (!board) {
      throw new Error('Board not found');
    }

    return board;
  }
}
