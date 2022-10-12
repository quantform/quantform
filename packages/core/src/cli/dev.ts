import { join } from 'path';

import { Bootstrap } from '../bootstrap';
import { prepare } from '../strategy';
import build from './build';
import { buildDirectory } from './internal/workspace';

export default async function (name: string, options: any) {
  if (await build()) {
    return;
  }

  const id = options.id ? Number(options.id) : undefined;

  await import(join(buildDirectory(), 'index'));

  const { descriptor, register } = prepare(name);

  const bootstrap = new Bootstrap(descriptor);
  const session = bootstrap.useSessionId(id).paper();

  await session.awake();

  register(session).subscribe();
}
