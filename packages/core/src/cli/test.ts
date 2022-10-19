import { join } from 'path';

import { SessionBuilder } from '../domain/session-builder';
import { Logger, now } from '../shared';
import { spawn } from '..';
import build from './build';
import { buildDirectory } from './internal/workspace';

export default async function (name: string, options: any) {
  if (await build()) {
    return;
  }

  await import(join(buildDirectory(), 'index'));

  const builder = new SessionBuilder().useSessionId(
    options.id ? Number(options.id) : now()
  );

  const rules = await spawn(name, builder);

  const startTime = performance.now();

  const [session, backtester] = builder.backtest({
    onBacktestStarted: () => Logger.info('backtest', `new session ${session.id} started`),
    onBacktestCompleted: async () => {
      await session.dispose();

      const seconds = ((performance.now() - startTime) / 1000).toFixed(3);

      Logger.info('backtest', `session ${session.id} completed in ${seconds}s`);
    }
  });

  await session.awake();

  rules(session).subscribe();

  backtester.tryContinue();
}
