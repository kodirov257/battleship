import { UserRepository } from '../repositories/user-repository';
import { RoomService } from '../services/room-service';
import { Room } from '../models/room';
import { GameService } from 'services/game-service';

export class RoomController {
  private service: RoomService;
  private gameService: GameService;
  private userRepository: UserRepository;

  constructor(
    service: RoomService,
    gameService: GameService,
    userRepository: UserRepository,
  ) {
    this.service = service;
    this.userRepository = userRepository;
    this.gameService = gameService;
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
      const room = this.service.addUser(roomId, req.user.id);
      if (!room.isAvailable() && room.getUsers().length >= 2) {
        const game = this.gameService.create(
          room.getId(),
          room.getUsers()[0]!,
          room.getUsers()[1]!,
        );
        room.setGame(game);
      }
      return room;
    } catch (e) {
      throw e;
    }
  }
}
