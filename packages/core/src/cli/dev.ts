import { Bootstrap } from '../bootstrap';
import build from './build';
import { getStrategy } from './internal/workspace';

export default async function (name: string, options: any) {
  if (await build()) {
    return;
  }

  const id = options.id ? Number(options.id) : undefined;

  const module = await getStrategy(name);

  const bootstrap = new Bootstrap(module.descriptor);
  const session = bootstrap.useSessionId(id).paper();

  await session.awake(module.default);
}
