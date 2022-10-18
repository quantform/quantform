import { Presets, SingleBar } from 'cli-progress';
import { join } from 'path';

import { spawn } from '..';
import { instrumentOf } from '../domain';
import { SessionBuilder } from '../domain/session-builder';
import { now } from '../shared';
import { Feed } from '../storage';
import build from './build';
import { buildDirectory } from './internal/workspace';

export default async function (name: string, instrument: string, options: any) {
  if (await build()) {
    return;
  }
  await import(join(buildDirectory(), 'index'));

  const builder = new SessionBuilder().useSessionId(
    options.id ? Number(options.id) : now()
  );

  await spawn(name, builder);

  const session = builder.paper();

  console.time('Pulling completed in');

  await session.awake();

  const bar = new SingleBar(
    {
      format: `Pulling ${instrument} [{bar}] {percentage}% | ETA: {eta}s | {value}/{total}`
    },
    Presets.rect
  );

  const feed = new Feed(builder.storage('feed'));
  const from = options.from ? Date.parse(options.from) : builder.period.from;
  const to = options.to ? Date.parse(options.to) : builder.period.to;

  bar.start(100, 0);

  await session.aggregate.feed(
    instrumentOf(instrument),
    from,
    to,
    async (timestamp, events) => {
      const duration = to - from;
      const completed = timestamp - from;

      await feed.save(events);

      bar.update(Math.floor((completed / duration) * 100));
    }
  );

  bar.update(100);
  bar.stop();

  await session.dispose();

  console.timeLog('Pulling completed in');
}
