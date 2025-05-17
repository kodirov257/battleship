import { ScoreRepository } from '../repositories/score-repository';
import { Score } from '../models/score';

export class ScoreService {
  private repository: ScoreRepository;

  constructor(repository: ScoreRepository) {
    this.repository = repository;
  }

  public getWinners(): Score[] {
    const winners = this.repository.all();

    return winners.sort((a, b) => b.getPoints() - a.getPoints());
  }

  public addWinner(userId: string): Score {
    const scodeObj = this.repository.find(userId);

    if (!scodeObj) {
      throw new Error('Player not found');
    }

    scodeObj.addScore(1);
    this.repository.update(scodeObj);

    return scodeObj;
  }
}
