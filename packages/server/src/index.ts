import { Session, SessionDescriptor, session, instrumentOf } from '@quantform/core';
import { BinanceAdapter } from '@quantform/binance';
import { SessionDescriptorRegistry } from './service/session-descriptor-registry';
import { createExpressServer, useContainer } from 'routing-controllers';
import { Container } from 'typedi';
import { SessionController } from './controller/session.controller';
import 'reflect-metadata';

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
  adapter() {
    return [new BinanceAdapter()];
  }

  async awake(session: Session) {
    session
      .orderbook(instrumentOf('binance:btc-usdt'))
      .subscribe(it => console.log(it.midRate));
  }
}

serve(3001, new MomentumStrategy());
