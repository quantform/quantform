import * as dotenv from 'dotenv';

import { Bootstrap } from '../bootstrap';
import build from './build';
import { getStrategy } from './internal/workspace';

export default async function (name, options: any) {
  if (await build()) {
    return;
  }

  dotenv.config();

  const id = options.id ? Number(options.id) : undefined;

  const module = await getStrategy(name);

  const bootstrap = new Bootstrap(module.descriptor);
  const session = bootstrap.useSessionId(id).live();

  await session.awake(module.default);
}
