import { Container } from '../framework/container';
import { UserRepository } from '../repositories/user-repository';
import { UserService } from '../services/user-service';
import { AuthController } from '../controllers/auth-controller';
import { ScoreRepository } from '../repositories/score-repository';
import { ScoreService } from '../services/score-service';
import { ScoreController } from '../controllers/score-controller';
import { RoomRepository } from '../repositories/room-repository';
import { RoomService } from '../services/room-service';
import { RoomController } from '../controllers/room-controller';
import { GameRepository } from '../repositories/game-repository';
import { GameService } from '../services/game-service';
import { GameController } from '../controllers/game-controller';
import { ShipRepository } from '../repositories/ship-repository';

const container: Container = Container.getInstance();

/////////////////////////////////////////// User
container.register(UserRepository.name, {
  useClass: UserRepository,
  singleton: true,
});

container.register(UserService.name, {
  useClass: UserService,
  singleton: true,
  dependencies: [UserRepository.name],
});

container.register(AuthController.name, {
  useClass: AuthController,
  singleton: true,
  dependencies: [UserService.name],
});
///////////////////////////////////////////

/////////////////////////////////////////// Score
container.register(ScoreRepository.name, {
  useClass: ScoreRepository,
  singleton: true,
});

container.register(ScoreService.name, {
  useClass: ScoreService,
  singleton: true,
  dependencies: [ScoreRepository.name],
});

container.register(ScoreController.name, {
  useClass: ScoreController,
  singleton: true,
  dependencies: [ScoreService.name, UserRepository.name],
});
///////////////////////////////////////////

/////////////////////////////////////////// Room
container.register(RoomRepository.name, {
  useClass: RoomRepository,
  singleton: true,
});

container.register(RoomService.name, {
  useClass: RoomService,
  singleton: true,
  dependencies: [RoomRepository.name],
});

container.register(RoomController.name, {
  useClass: RoomController,
  singleton: true,
  dependencies: [RoomService.name, GameService.name, UserRepository.name],
});
///////////////////////////////////////////

/////////////////////////////////////////// Game
container.register(GameRepository.name, {
  useClass: GameRepository,
  singleton: true,
});

container.register(GameService.name, {
  useClass: GameService,
  singleton: true,
  dependencies: [GameRepository.name, ShipRepository.name],
});

container.register(GameController.name, {
  useClass: GameController,
  singleton: true,
  dependencies: [GameService.name],
});
///////////////////////////////////////////

/////////////////////////////////////////// Ship
container.register(ShipRepository.name, {
  useClass: ShipRepository,
  singleton: true,
});
///////////////////////////////////////////

export default container;
