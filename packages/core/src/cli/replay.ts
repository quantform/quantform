import build from '@lib/cli/build';
import { replayOptions } from '@lib/replay';
import { useSession } from '@lib/session';
import { useExecutionMode } from '@lib/use-execution-mode';

import { Script } from './internal/script';

export default async function (
  name: string,
  options: { id?: string; from?: string; to?: string }
) {
  if (await build()) {
    return;
  }

  const from = options.from ? new Date(options.from).getTime() : 0;
  const to = options.to ? new Date(options.to).getTime() : Number.MAX_VALUE;

  const script = new Script(name, [
    useSession.options({ id: options.id ?? Date.now().toString() }),
    replayOptions({ from, to }),
    useExecutionMode.replayOptions()
  ]);
  const output = await script.run();

  console.log(output);
}
