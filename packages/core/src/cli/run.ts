import * as dotenv from 'dotenv';
import { join } from 'path';

import { Bootstrap } from '../bootstrap';
import { compile } from './internal/compiler';

export async function run(file: string, options: any) {
  dotenv.config();

  const id = options.id ? Number(options.id) : undefined;

  const module = await compile(join(process.cwd(), file));

  const bootstrap = new Bootstrap(module.descriptor);
  const session = bootstrap.useSessionId(id).live();

  await session.awake(module.default);
}
