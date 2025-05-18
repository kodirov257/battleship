import { UserRepository } from '../repositories/user-repository';
import { RoomService } from '../services/room-service';
import { Room } from '../models/room';

export class RoomController {
  private service: RoomService;
  private userRepository: UserRepository;

  constructor(service: RoomService, userRepository: UserRepository) {
    this.service = service;
    this.userRepository = userRepository;
  }

  public create(req: any): Room {
    try {
      return this.service.create(req.user.id);
    } catch (e) {
      throw e;
    }
  }

  public getAvailableRooms() {
    const rooms = this.service.getAvailableRooms();

    const result = [];
    for (const room of rooms) {
      const userInfo = [];
      for (const userId of room.getUsers()) {
        const user = this.userRepository.find(userId);

        if (!user) {
          throw new Error('User not found');
        }

        userInfo.push({
          name: user.name,
          index: user.id,
        });
      }
      result.push({
        roomId: room.getId(),
        roomUsers: userInfo,
      });
    }

    return result;
  }

  public addUserToRoom(req: any, roomId: string) {
    try {
      return this.service.addUser(roomId, req.user.id);
    } catch (e) {
      throw e;
    }
  }
}
