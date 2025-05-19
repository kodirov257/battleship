import { randomUUID } from 'node:crypto';

import { Repository } from '../contracts/repository';
import { Direction, Ship, Type } from '../models/ship';

const games: Record<string, Ship> = {};

export class ShipRepository implements Repository<Ship> {
  public all(): Ship[] {
    return Object.values(games);
  }

  public create(
    gameId: string,
    x: number,
    y: number,
    direction: Direction,
    length: number,
    type: Type,
  ): Ship {
    const ship = new Ship(
      randomUUID().toString(),
      gameId,
      x,
      y,
      direction,
      length,
      type,
    );

    games[ship.getId()] = ship;

    return ship;
  }

  public find(id: string): Ship | undefined {
    return games[id];
  }

  public update(ship: Ship): Ship {
    games[ship.getId()] = ship;

    return ship;
  }

  public remove(ship: Ship): boolean {
    if (games[ship.getId()]) {
      delete games[ship.getId()];
      return true;
    }
    return false;
  }
}
