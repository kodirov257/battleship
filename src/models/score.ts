export class Score {
  private readonly user_id: string;
  private point: number;

  constructor(user_id: string, score: number) {
    this.user_id = user_id;
    this.point = score;
  }

  public addScore(point: number = 1): void {
    this.point += point;
  }

  public getId = (): string => {
    return this.user_id;
  };

  public getPoints = (): number => {
    return this.point;
  };
}
