import { AuthController } from './controllers/auth-controller';
import { Container } from './framework/container';
import { parseRequest } from './utils';

const wsRoutes = ['reg'];

const wsHandler = (request: string): any => {
  const data = parseRequest(request);

  if (!wsRoutes.includes(data.type)) {
    throw new Error('Invalid request type');
  }

  let result = {};
  let controller = null;
  try {
    switch (data.type) {
      case 'reg':
        controller = Container.getInstance().get<AuthController>(
          AuthController.name,
        );
        result = controller.register(data.data);
        return [{ type: data.type, data: JSON.stringify(result), id: data.id }];
    }

    return { type: data.type, data: JSON.stringify(result), id: data.id };
  } catch (e) {
    throw e;
  }
};

export default {
  wsHandler,
};
