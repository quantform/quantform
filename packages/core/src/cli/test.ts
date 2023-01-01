import { join } from 'path';

import build from '@lib/cli/build';
import { buildDirectory } from '@lib/cli/internal/workspace';
import { log, now } from '@lib/shared';

export default async function (name: string, options: any) {
  if (await build()) {
    return;
  }

  await import(join(buildDirectory(), 'index'));

  /*const builder = new SessionBuilder().useSessionId(
    options.id ? Number(options.id) : now()
  );

  const rules = await spawn(name, builder);
  const logger = log('backtester');

  const startTime = performance.now();

  const [session, backtester] = builder.backtest({
    onBacktestStarted: () => logger.info(`new session ${session.id} started`),
    onBacktestCompleted: async () => {
      await session.dispose();

      const seconds = ((performance.now() - startTime) / 1000).toFixed(3);

      logger.info(`session ${session.id} completed in ${seconds}s`);
    }
  });

  await session.awake();

  rules(session).subscribe();

  backtester.tryContinue();*/
}
