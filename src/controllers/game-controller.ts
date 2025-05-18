import { GameService } from '../services/game-service';

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
}
