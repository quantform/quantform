import { join } from 'path';

import { SessionBuilder } from '../domain/session-builder';
import { now } from '../shared';
import { prepare } from '../strategy';
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

  const rules = await prepare(name, builder);

  const session = builder.live();
  await session.awake();

  rules(session).subscribe();
}
