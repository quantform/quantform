import { Bootstrap } from '../bootstrap';
import { loadStrategy } from './internal/loader';

export async function dev(name: string, options: any) {
  const id = options.id ? Number(options.id) : undefined;

  const module = await loadStrategy(name);

  const bootstrap = new Bootstrap(module.descriptor);
  const session = bootstrap.useSessionId(id).paper();

  await session.awake(module.default);
}
