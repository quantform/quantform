import { SessionFactory, SessionOptimizer } from '@quantform/core';
import { Service } from 'typedi';
import { SessionDescriptorRegistry } from './session-descriptor-registry';

@Service()
export class BacktestingService {
  constructor(private readonly registry: SessionDescriptorRegistry) {}

  async start(name: string) {
    const descriptor = this.registry.resolve(name);

    SessionOptimizer.source = {};

    const session = SessionFactory.paper(descriptor, {
      balance: {
        'binance:usdt': 100
      }
    });

    await descriptor.awake(session);
    await session.initialize();
  }
}
