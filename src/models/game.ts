export class Game {
  private readonly id: string;
  private readonly room_id: string;
  private readonly first_player_id: string;
  private readonly second_player_id: string;
  private winner?: string;

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
  }

  public getId(): string {
    return this.id;
  }

  public getRoomId(): string {
    return this.room_id;
  }

  public getPlayer1Id(): string {
    return this.first_player_id;
  }

  public getPlayer2Id(): string {
    return this.second_player_id;
  }

  public setWinner(winner: string) {
    this.winner = winner;
  }

  public getWinner(): string | undefined {
    return this.winner;
  }
}
