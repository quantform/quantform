import build from '@lib/cli/build';
import { sessionOptions } from '@lib/session';
import { paperExecutionMode } from '@lib/use-execution-mode';

import { Script } from './internal/script';

export default async function (
  name: string,
  options: { id?: string; recording?: boolean }
) {
  if (await build()) {
    return;
  }

  const script = new Script(name, [
    sessionOptions({ id: options.id ?? Date.now().toString() }),
    paperExecutionMode({ recording: options.recording ?? false })
  ]);
  const output = await script.run();

  console.log(output);
}
