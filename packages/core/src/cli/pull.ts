import { Presets, SingleBar } from 'cli-progress';

import { Bootstrap } from '../bootstrap';
import { instrumentOf } from '../domain';
import { Feed } from '../storage';
import build from './build';
import { missingDescriptorParameterError, missingStorageFactoryError } from './error';
import { getModule } from './internal/workspace';

export default async function (name: string, instrument: string, options: any) {
  if (await build()) {
    return;
  }

  const id = options.id ? Number(options.id) : undefined;

  const module = await getModule(name);

  const bootstrap = new Bootstrap(module.descriptor);
  const session = bootstrap.useSessionId(id).paper();

  if (!module.descriptor.storage) {
    throw missingStorageFactoryError();
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

  console.time('Pulling completed in');

  await session.awake(undefined);

  const bar = new SingleBar(
    {
      format: `Pulling ${instrument} [{bar}] {percentage}% | ETA: {eta}s | {value}/{total}`
    },
    Presets.rect
  );
  const feed = new Feed(module.descriptor.storage('feed'));

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
