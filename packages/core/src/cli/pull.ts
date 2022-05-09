import { Presets, SingleBar } from 'cli-progress';

import { Bootstrap } from '../bootstrap';
import { instrumentOf } from '../domain';
import { Feed } from '../storage';
import build from './build';
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

  console.time('Pulling completed in');

  await session.awake(undefined);

  const bar = new SingleBar({}, Presets.shades_classic);
  const feed = new Feed(module.descriptor.storage('feed'));

  bar.start(100, 0);

  await session.aggregate.feed({
    instrument: instrumentOf(instrument),
    from,
    to,
    destination: feed,
    callback: timestamp => {
      const duration = to - from;
      const completed = timestamp - from;

      bar.update(Math.floor((completed / duration) * 100));
    }
  });

  bar.update(100);
  bar.stop();

  await session.dispose();

  console.timeLog('Pulling completed in');
}
