import { Ship } from './ship';

export type CellType = number | string;
export type Board = CellType[][];

export class Game {
  public static readonly BOARD_SIZE: number = 10;

  private readonly id: string;
  private readonly room_id: string;
  private readonly first_player_id: string;
  private readonly second_player_id: string;
  private winner?: string;
  private readonly boards: Record<string, Board>;
  private readonly ships: Record<string, Record<string, Ship>>;

  constructor(
    id: string,
    room_id: string,
    player1_id: string,
    player2_id: string,
  ) {
    this.id = id;
    this.room_id = room_id;
    this.first_player_id = player1_id;
    this.second_player_id = player2_id;
    this.winner = undefined;

    this.boards = {
      [this.first_player_id]: Array.from({ length: Game.BOARD_SIZE }, () =>
        Array(Game.BOARD_SIZE).fill(0),
      ),
      [this.second_player_id]: Array.from({ length: Game.BOARD_SIZE }, () =>
        Array(Game.BOARD_SIZE).fill(0),
      ),
    };

    this.ships = {
      [this.first_player_id]: {},
      [this.second_player_id]: {},
    };
  }

  public getId(): string {
    return this.id;
  }

  public getRoomId(): string {
    return this.room_id;
  }

  public getFirstPlayerId(): string {
    return this.first_player_id;
  }

  public getSecondPlayerId(): string {
    return this.second_player_id;
  }

  public getPlayers(): string[] {
    return [this.first_player_id, this.second_player_id];
  }

  public setWinner(winner: string) {
    this.winner = winner;
  }

  public getWinner(): string | undefined {
    return this.winner;
  }

  public setBoard(playerId: string, board: Board): void {
    this.boards[playerId] = board;
  }

  public getBoard(playerId: string): Board | undefined {
    return this.boards[playerId];
  }

  public setShip(playerId: string, ship: Ship): void {
    if (!this.ships[playerId]) {
      this.ships[playerId] = {};
    }

    this.ships[playerId][ship.getId()] = ship;
  }

  public getShips(playerId: string): Record<string, Ship> | undefined {
    return this.ships[playerId];
  }

  public getShip(playerId: string, shipId: string): Ship | undefined {
    return this.ships[playerId]?.[shipId];
  }

  public isReady(): boolean {
    return (
      Object.keys(this.ships[this.first_player_id]!).length > 0 &&
      Object.keys(this.ships[this.second_player_id]!).length > 0
    );
  }
}
