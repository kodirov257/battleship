import WebSocket from 'ws';

type Request = { [key: string]: any };
type Context = { req: Request; socket: WebSocket; data?: any };
type Next = () => Promise<any> | any;

export type Middleware = (context: Context, next: Next) => Promise<void>;

type Pipe<T> = {
  use: (...middlewares: Middleware[]) => void;
  handle: (context: Context) => Promise<T | void>;
};

export class Pipeline<T> {
  public readonly container: Middleware[];

  constructor(...middlewares: Middleware[]) {
    this.container = middlewares;
  }

  public use: Pipe<T>['use'] = (...middlewares: Middleware[]): void => {
    this.container.push(...middlewares);
  };

  public handle: Pipe<T>['handle'] = async (context: Context) => {
    const handler = async (index: number): Promise<void | T> => {
      if (index === this.container.length) {
        return;
      }

      const middleware = this.container[index++];

      if (middleware) {
        await middleware(context, () => handler(index));
      }
    };

    const response = await handler(0);
    if (response) {
      return response;
    }
  };
}
