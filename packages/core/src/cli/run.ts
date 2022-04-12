import * as dotenv from 'dotenv';

import { Bootstrap } from '../bootstrap';
import { loadStrategy } from './internal/loader';

export default async function (name, options: any) {
  dotenv.config();

  const id = options.id ? Number(options.id) : undefined;

  const module = await loadStrategy(name);

  const bootstrap = new Bootstrap(module.descriptor);
  const session = bootstrap.useSessionId(id).live();

  await session.awake(module.default);
}
