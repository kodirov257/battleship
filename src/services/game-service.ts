import { GameRepository } from '../repositories/game-repository';
import { Game } from '../models/game';

export class GameService {
  private repository: GameRepository;

  constructor(repository: GameRepository) {
    this.repository = repository;
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
}
