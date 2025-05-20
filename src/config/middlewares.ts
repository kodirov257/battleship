import { Middleware, Pipeline } from '../framework/middleware';
import { connections } from './users';
import { AuthError } from '../exceptions/auth-error';

let middleware: Pipeline<any> = new Pipeline();

const middlewares: { [key: string]: Middleware } = {
  auth: async (context: any, next: any): Promise<void> => {
    if (!connections.has(context.socket)) {
      throw new AuthError('User must be authenticated');
    }

    context.req.user = connections.get(context.socket);

    await next();
  },
};

export const setAllMiddlewares = (
  routeMiddlewares: string[],
): Pipeline<any> => {
  setDefaultMiddleware();

  for (const key of routeMiddlewares) {
    if (!middlewares[key]) {
      throw new Error(`Invalid middleware: ${key}`);
    }
    middleware.use(middlewares[key]);
  }

  return middleware;
};

export const setDefaultMiddleware = (): void => {
  middleware = new Pipeline();
};

setDefaultMiddleware();

export default middleware;
