import { randomUUID } from 'node:crypto';

import { Repository } from '../contracts/repository';
import { Game } from '../models/game';

const games: Record<string, Game> = {};

export class GameRepository implements Repository<Game> {
  public all(): Game[] {
    return Object.values(games);
  }

  public create(
    roomId: string,
    firstPlayerId: string,
    secondPlayerId: string,
  ): Game {
    const game = new Game(
      randomUUID().toString(),
      roomId,
      firstPlayerId,
      secondPlayerId,
    );

    games[game.getId()] = game;

    return game;
  }

  public find(id: string): Game | undefined {
    return games[id];
  }

  public update(game: Game): Game {
    games[game.getId()] = game;

    return game;
  }

  public remove(game: Game): boolean {
    if (games[game.getId()]) {
      delete games[game.getId()];
      return true;
    }
    return false;
  }
}
