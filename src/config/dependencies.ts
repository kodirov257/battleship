import { Container } from '../framework/container';
import { UserRepository } from '../repositories/user-repository';
import { UserService } from '../services/user-service';
import { AuthController } from '../controllers/auth-controller';
import { ScoreRepository } from '../repositories/score-repository';
import { ScoreService } from '../services/score-service';
import { ScoreController } from '../controllers/score-controller';

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

export default container;
