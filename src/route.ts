import { AuthController } from './controllers/auth-controller';
import { Container } from './framework/container';
import { parseRequest } from './utils';
import { ScoreController } from './controllers/score-controller';

const wsRoutes = ['reg'];

const wsHandler = (request: string): any => {
  const data = parseRequest(request);

  if (!wsRoutes.includes(data.type)) {
    throw new Error('Invalid request type');
  }

  const scoreController = Container.getInstance().get<ScoreController>(
    ScoreController.name,
  );

  let result = {};
  let authController = null;
  const broadcast = [];
  try {
    switch (data.type) {
      case 'reg':
        authController = Container.getInstance().get<AuthController>(
          AuthController.name,
        );
        result = authController.register(data.data);

        const winners = scoreController.getWinners();
        broadcast.push({
          type: 'update_winners',
          data: JSON.stringify(winners),
          id: data.id,
        });

        return {
          result: {
            type: data.type,
            data: JSON.stringify(result),
            id: data.id,
          },
          broadcast,
        };
    }

    return {
      result: { type: data.type, data: JSON.stringify(result), id: data.id },
    };
  } catch (e) {
    throw e;
  }
};

export default {
  wsHandler,
};
