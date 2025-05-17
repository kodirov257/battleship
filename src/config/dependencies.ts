import { Container } from '../framework/container';
import { UserRepository } from '../repositories/user-repository';
import { UserService } from '../services/user-service';
import {AuthController} from "../controllers/auth-controller";

const container: Container = Container.getInstance();

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

export default container;
