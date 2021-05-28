import { AdapterAggregate, SessionFactory, Store } from '@quantform/core';
import { SessionDescriptorRegistry } from './session-descriptor.registry';
import { Service } from 'typedi';

@Service()
export class SessionService {
  constructor(private readonly registry: SessionDescriptorRegistry) {}

  async universe(name: string) {
    const descriptor = this.registry.resolve(name);
    const store = new Store();

    const aggregate = new AdapterAggregate(store, descriptor.adapter());
    await aggregate.initialize(false);
    await aggregate.dispose();

    return {
      instruments: Object.keys(store.snapshot.universe.instrument).sort()
    };
  }

  async backtest(name: string, from: number, to: number) {
    const descriptor = this.registry.resolve(name);
    const session = SessionFactory.backtest(descriptor, {
      from,
      to,
      balance: {
        'binance:usdt': 100
      }
    });

    await descriptor.awake(session);
    await session.initialize();
  }
}
