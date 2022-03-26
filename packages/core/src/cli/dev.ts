import { join } from 'path';

import { Bootstrap } from '../bootstrap';
import { compile } from './internal/compiler';

export async function dev(file: string, options: any) {
  const id = options.id ? Number(options.id) : undefined;

  const module = await compile(join(process.cwd(), file));

  const bootstrap = new Bootstrap(module.descriptor);
  const session = bootstrap.useSessionId(id).paper();

  await session.awake(module.default);
}
