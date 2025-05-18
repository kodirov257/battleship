export class Room {
  private readonly id: string;
  private readonly created_by: string;
  private readonly users: string[];
  private available: boolean;

  constructor(id: string, created_by: string, users: string[] = []) {
    this.id = id;
    this.created_by = created_by;
    this.users = users;
    this.available = true;
  }

  public addUser(user: string) {
    this.users.push(user);
  }

  public setStatus(status: boolean) {
    this.available = status;
  }

  public getId(): string {
    return this.id;
  }

  public getCreatedBy(): string {
    return this.created_by;
  }

  public getUsers(): string[] {
    return this.users;
  }

  public isAvailable(): boolean {
    return this.available;
  }
}
