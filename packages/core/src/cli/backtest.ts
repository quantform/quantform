import { BacktesterStreamer } from '../adapter';
import { Bootstrap } from '../bootstrap';
import { Logger } from '../shared';
import { loadStrategy } from './internal/loader';

export async function backtest(name, options: any) {
  const module = await loadStrategy(name);

  const bootstrap = new Bootstrap(module.descriptor);

  if (!module.descriptor.feed) {
    throw new Error('Please provide a "feed" property in session descriptor.');
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
    const [session, streamer] = bootstrap.useBacktestPeriod(from, to).backtest({
      onBacktestStarted: (streamer: BacktesterStreamer) => console.log('started'),
      onBacktestUpdated: (streamer: BacktesterStreamer) => console.log('started'),
      onBacktestCompleted: async (streamer: BacktesterStreamer) => {
        await session.dispose();
        resolve();
      }
    });

    await session.awake(module.default);
  });
}
