import { BacktesterStreamer } from '../adapter';
import { Bootstrap } from '../bootstrap';
import build from './build';
import { getStrategy } from './internal/workspace';

export default async function (name, options: any) {
  if (await build()) {
    return;
  }

  const module = await getStrategy(name);

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

  await new Promise<void>(async resolve => {
    const [session] = bootstrap.useBacktestPeriod(from, to).backtest({
      onBacktestCompleted: async () => {
        await session.dispose();

        console.log('backtest completed.');

        resolve();
      }
    });

    await session.awake(module.default);
  });
}
