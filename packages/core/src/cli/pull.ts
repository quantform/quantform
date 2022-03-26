import { join } from 'path';

import { Bootstrap } from '../bootstrap';
import { instrumentOf } from '../domain';
import { compile } from './internal/compiler';

export async function pull(file: string, instrument: string, options: any) {
  const id = options.id ? Number(options.id) : undefined;

  const module = await compile(join(process.cwd(), file));

  const bootstrap = new Bootstrap(module.descriptor);
  const session = bootstrap.useSessionId(id).paper();

  await session.awake(module.default);

  await session.aggregate.feed({
    instrument: instrumentOf(instrument),
    from: options.from ? Date.parse(options.from) : undefined,
    to: options.to ? Date.parse(options.to) : undefined,
    destination: module.descriptor.feed,
    callback: timestamp => {
      console.log(timestamp);
    }
  });

  await session.dispose();
}
