import { Bootstrap } from '../bootstrap';
import { Logger } from '../shared';
import build from './build';
import { missingDescriptorParameterError } from './error';
import { getModule } from './internal/workspace';

export default async function (name: string, options: any) {
  if (await build()) {
    return;
  }

  const module = await getModule(name);

  const bootstrap = new Bootstrap(module.descriptor);

  if (!module.descriptor.storage) {
    throw missingDescriptorParameterError('storage');
  }

  if (!module.descriptor.simulation) {
    throw missingDescriptorParameterError('simulation');
  }

  const from = options.from
    ? Date.parse(options.from)
    : module.descriptor.simulation.from;

  if (!from) {
    throw missingDescriptorParameterError('from');
  }

  const to = options.to ? Date.parse(options.to) : module.descriptor.simulation.to;

  if (!to) {
    throw missingDescriptorParameterError('to');
  }

  const startTime = performance.now();

  await new Promise<void>(resolve => {
    const [session] = bootstrap.useBacktestPeriod(from, to).backtest({
      onBacktestStarted: () =>
        Logger.info('backtest', `new session ${session.descriptor?.id} started`),
      onBacktestCompleted: async () => {
        await session.dispose();

        const seconds = ((performance.now() - startTime) / 1000).toFixed(3);

        Logger.info(
          'backtest',
          `session ${session.descriptor?.id} completed in ${seconds}s`
        );

        resolve();
      }
    });

    session.awake(module.default);
  });
}
