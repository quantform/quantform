import build from '@lib/cli/build';
import { replayOptions } from '@lib/replay';
import { useSession } from '@lib/session';
import { useExecutionMode } from '@lib/use-execution-mode';
import { convert, s } from '@lib/use-timestamp';

import { Script } from './internal/script';

export default async function (
  name: string,
  options: { id?: string; from?: string; to?: string; storage?: string }
) {
  if (await build()) {
    return;
  }

  const from = convert(
    s(options.from ? new Date(options.from).getTime() : 0),
    'ms',
    'ns'
  );

  const to = convert(
    s(options.to ? new Date(options.to).getTime() : new Date().getTime()),
    'ms',
    'ns'
  );

  const storage = options.storage ?? 'backtest';

  const script = new Script(name, [
    useSession.options({ id: options.id ?? Date.now().toString() }),
    replayOptions({ from, to, storage }),
    useExecutionMode.replayOptions()
  ]);
  const output = await script.run();

  console.log(output);
}
