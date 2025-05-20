import { Repository } from 'contracts/repository';
import { Score } from '../models/score';

const scores: Record<string, Score> = {};

export class ScoreRepository implements Repository<Score> {
  all(): Score[] {
    return Object.values(scores);
  }

  create(user_id: string, score: number = 1): Score {
    const scoreObj = new Score(user_id, score);

    scores[scoreObj.getId()] = scoreObj;

    return scoreObj;
  }

  find(user_id: string): Score | undefined {
    return scores[user_id];
  }

  update(score: Score): Score {
    scores[score.getId()] = score;
    return score;
  }

  remove(user_id: string): boolean {
    if (scores[user_id]) {
      delete scores[user_id];
      return true;
    }
    return false;
  }
}
