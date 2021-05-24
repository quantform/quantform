import { SessionDescriptor } from '@quantform/core';
import { SessionDescriptorRegistry } from './service/session-descriptor-registry';
import { createExpressServer, useContainer } from 'routing-controllers';
import { Container } from 'typedi';
import { SessionController } from './controller/session.controller';
import 'reflect-metadata';
import { session } from '@quantform/core';
import { Session } from '@quantform/core';
import { ExchangeBinanceAdapter } from '@quantform/binance';

useContainer(Container);

export function serve(port: number, ...descriptors: SessionDescriptor[]) {
  const registry = Container.get(SessionDescriptorRegistry);

  for (const descriptor of descriptors) {
    registry.register(descriptor);
  }

  const app = createExpressServer({
    controllers: [SessionController]
  });

  app.listen(port);
}

@session('momentum')
export class MomentumStrategy extends SessionDescriptor {
  options() {
    return {
      feed: null,
      from: Date.parse('2021-01-01 00:00'),
      to: Date.parse('2021-05-01 00:00'),
      balance: {
        ['binance:usdt']: 200
      }
    };
  }

  adapter() {
    return [new ExchangeBinanceAdapter()];
  }

  async awake(session: Session) {}
}

serve(3001, new MomentumStrategy());
