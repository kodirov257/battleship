export class AuthError extends Error {
  private readonly code: number;

  constructor(message: string, code: number = 401, options?: ErrorOptions) {
    super(message, options);
    this.code = code;
  }

  public getCode(): number {
    return this.code;
  }
}
