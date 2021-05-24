import { Session, SessionFactory, SessionOptimizer } from '@quantform/core';
import { Service } from 'typedi';
import { SessionDescriptorRegistry } from './session-descriptor-registry';

@Service()
export class BacktestingService {
  constructor(private readonly registry: SessionDescriptorRegistry) {}

  async start(name: string) {
    const descriptor = this.registry.resolve(name);

    const statement = {};

    const session = await new Promise<Session>(async resolve => {
      SessionOptimizer.source = {};

      const session = SessionFactory.backtest(descriptor, () => resolve(session));

      await descriptor.awake(session);
      await session.initialize();
    });

    await session.statement(statement);
    await descriptor.dispose(session);
    await session.dispose();
  }
}
