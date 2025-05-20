import { randomUUID } from 'node:crypto';

import { Repository } from '../contracts/repository';
import { User } from '../models/user';

const users: Record<string, User> = {};

export class UserRepository implements Repository<User> {
  public all(): User[] {
    return Object.values(users);
  }

  public create(username: string, password: string): User {
    const user = new User(randomUUID().toString(), username, password);

    users[user.id] = user;

    return user;
  }

  public find(id: string): User | undefined {
    return users[id];
  }

  public update(user: User, username: string, password: string): User {
    user.name = username;
    user.password = password;

    users[user.id] = user;

    return user;
  }

  public remove(user: User): boolean {
    if (users[user.id]) {
      delete users[user.id];
      return true;
    }
    return false;
  }
}
