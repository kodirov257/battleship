export class User {
  public id: string;
  public name: string;
  public password: string;
  public score: number;

  constructor(id: string, username: string, password: string) {
    this.id = id;
    this.name = username;
    this.password = password;
    this.score = 0;
  }
}
