import { ScoreService } from 'services/score-service';
import { UserRepository } from '../repositories/user-repository';

export class ScoreController {
  private service: ScoreService;
  private userRepository: UserRepository;

  constructor(service: ScoreService, userRepository: UserRepository) {
    this.service = service;
    this.userRepository = userRepository;
  }

  public getWinners() {
    const winners = this.service.getWinners();
    const result = [];

    for (const winner of winners) {
      const user = this.userRepository.find(winner.getId());

      if (!user) {
        continue;
      }

      result.push({
        name: user.name,
        wins: winner.getPoints(),
      });
    }

    return result;
  }
}
