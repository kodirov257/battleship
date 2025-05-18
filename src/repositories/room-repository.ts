import { randomUUID } from 'node:crypto';

import { Room } from '../models/room';
import { Repository } from '../contracts/repository';

const rooms: Record<string, Room> = {};

export class RoomRepository implements Repository<Room> {
  public all(): Room[] {
    return Object.values(rooms);
  }

  public create(user_id: string): Room {
    const room = new Room(randomUUID().toString(), user_id);

    rooms[room.getId()] = room;

    return room;
  }

  public find(id: string): Room | undefined {
    return rooms[id];
  }

  public update(room: Room): Room {
    rooms[room.getId()] = room;
    return room;
  }

  public remove(id: string): boolean {
    if (rooms[id]) {
      delete rooms[id];
      return true;
    }
    return false;
  }
}
