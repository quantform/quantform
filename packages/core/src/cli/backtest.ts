import { join } from 'path';

import { BacktesterStreamer } from '../adapter';
import { Bootstrap } from '../bootstrap';
import { Logger } from '../shared';
import { compile } from './internal/compiler';

export async function backtest(file: string, options: any) {
  const from = Date.parse(options.from);
  const to = Date.parse(options.to);

  const module = await compile(join(process.cwd(), file));

  const bootstrap = new Bootstrap(module.descriptor);

  await new Promise<void>(async resolve => {
    const [session, streamer] = bootstrap.useBacktestPeriod(from, to).backtest({
      onBacktestStarted: (streamer: BacktesterStreamer) => console.log('started'),
      onBacktestUpdated: (streamer: BacktesterStreamer) => console.log('started'),
      onBacktestCompleted: (streamer: BacktesterStreamer) => {
        console.log('completed');

        session.dispose();
        resolve();
      }
    });

    await session.awake(module.default);
    await streamer.tryContinue().catch(it => Logger.error(it));
  });
}
