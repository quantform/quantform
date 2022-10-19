import { join } from 'path';

import { spawn } from '..';
import { SessionBuilder } from '../domain/session-builder';
import { now } from '../shared';
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

  const session = builder.paper();
  await session.awake();

  rules(session).subscribe();
}
