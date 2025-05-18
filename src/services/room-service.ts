import { RoomRepository } from '../repositories/room-repository';
import { Room } from '../models/room';

export class RoomService {
  private repository: RoomRepository;

  constructor(repository: RoomRepository) {
    this.repository = repository;
  }

  public getAvailableRooms(): Room[] {
    const rooms: Room[] = this.repository.all();

    return rooms.filter((room: Room) => room.isAvailable());
  }

  public create(userId: string): Room {
    return this.repository.create(userId);
  }

  public addUser(roomId: string, userId: string): Room {
    const room = this.repository.find(roomId);

    if (!room) {
      throw new Error('Room not found');
    }

    if (room.getUsers().length >= 2) {
      throw new Error('Room is full');
    }

    room.addUser(userId);
    if (room.getUsers().length >= 2) {
      room.setStatus(false);
    }
    this.repository.update(room);

    return room;
  }
}
