import { User } from '../models/user';
import { UserRepository } from '../repositories/user-repository';

export class UserService {
  private repository: UserRepository;

  constructor(repository: UserRepository) {
    this.repository = repository;
  }

  public find = (id: string): User | undefined => {
    return this.repository.find(id);
  };

  public register = (name: string, password: string): User => {
    return this.repository.create(name, password);
  };


}
