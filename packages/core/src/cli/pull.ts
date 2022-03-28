import { Presets, SingleBar } from 'cli-progress';

import { Bootstrap } from '../bootstrap';
import { instrumentOf } from '../domain';
import { loadStrategy } from './internal/loader';

export async function pull(name: string, instrument: string, options: any) {
  const id = options.id ? Number(options.id) : undefined;

  const module = await loadStrategy(name);

  const bootstrap = new Bootstrap(module.descriptor);
  const session = bootstrap.useSessionId(id).paper();

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

  await session.awake(undefined);

  const bar = new SingleBar({}, Presets.shades_classic);

  bar.start(100, 0);

  await session.aggregate.feed({
    instrument: instrumentOf(instrument),
    from,
    to,
    destination: module.descriptor.feed,
    callback: timestamp => {
      const duration = to - from;
      const completed = timestamp - from;

      bar.update(Math.floor((completed / duration) * 100));
    }
  });

  bar.update(100);
  bar.stop();

  await session.dispose();
}
