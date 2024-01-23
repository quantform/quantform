import build from '@lib/cli/build';
import { replayOptions } from '@lib/replay';
import { replayExecutionMode } from '@lib/use-execution-mode';

import { Script } from './internal/script';

export default async function (name: string, options: any) {
  if (await build()) {
    return;
  }

  const script = new Script(name, [
    replayOptions({ from: 0, to: Number.MAX_VALUE }),
    replayExecutionMode()
  ]);
  const output = await script.run();

  console.log(output);
}
