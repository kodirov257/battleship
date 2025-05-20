export type Direction = 'horizontal' | 'vertical';
export type Type = 'small' | 'medium' | 'large' | 'huge';

export class Ship {
  private readonly id: string;
  private readonly game_id: string;
  private readonly x: number;
  private readonly y: number;
  private readonly direction: Direction;
  private readonly length: number;
  private readonly type: Type;
  private destroyed: boolean;

  constructor(
    id: string,
    game_id: string,
    x: number,
    y: number,
    direction: Direction,
    length: number,
    type: Type,
  ) {
    this.id = id;
    this.game_id = game_id;
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.length = length;
    this.type = type;
    this.destroyed = false;
  }

  public getId(): string {
    return this.id;
  }

  public getGameId(): string {
    return this.game_id;
  }

  public getX(): number {
    return this.x;
  }

  public getY(): number {
    return this.y;
  }

  public getDirection(): Direction {
    return this.direction;
  }

  public getLength(): number {
    return this.length;
  }

  public getType(): Type {
    return this.type;
  }

  public isDestroyed(): boolean {
    return this.destroyed;
  }

  public destroy(): void {
    this.destroyed = true;
  }
}
