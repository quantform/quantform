import { join } from 'path';

import build from '@lib/cli/build';
import { buildDirectory } from '@lib/cli/internal/workspace';

export default async function (name: string, options: any) {
  if (await build()) {
    return;
  }

  const script = await import(join(buildDirectory(), name));

  /*const { module, hydrate } = quantform(strategy);

  await module.awake();
  await hydrate(module);*/
}
