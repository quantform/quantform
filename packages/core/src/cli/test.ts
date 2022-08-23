import { Bootstrap } from '../bootstrap';
import { Logger } from '../shared';
import build from './build';
import { getModule } from './internal/workspace';

export default async function (name, options: any) {
  if (await build()) {
    return;
  }

  const module = await getModule(name);

  const bootstrap = new Bootstrap(module.descriptor);

  if (!module.descriptor.storage) {
    throw new Error('Please provide a "storage" property in session descriptor.');
  }

  const from = options.from
    ? Date.parse(options.from)
    : module.descriptor.simulation.from;

  if (!from) {
    throw new Error(
      'Please set a "from" date in session descriptor or provide the date as parameter.'
    );
  }

  const to = options.to ? Date.parse(options.to) : module.descriptor.simulation.to;

  if (!to) {
    throw new Error(
      'Please set a "to" date in session descriptor or provide the date as parameter.'
    );
  }

  const startTime = performance.now();

  await new Promise<void>(async resolve => {
    const [session] = bootstrap.useBacktestPeriod(from, to).backtest({
      onBacktestStarted: () => Logger.info('backtest', 'new session started.'),
      onBacktestCompleted: async () => {
        await session.dispose();

        const seconds = ((performance.now() - startTime) / 1000).toFixed(3);

        Logger.info('backtest', `completed in ${seconds}s`);

        resolve();
      }
    });

    await session.awake(module.default);
  });
}
