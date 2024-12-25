import build from '@lib/cli/build';
import { liveExecutionMode } from '@lib/use-execution-mode';

import { Script } from './internal/script';

export default async function (name: string, options: { recording?: boolean }) {
  if (await build()) {
    return;
  }

  const script = new Script(name, [
    liveExecutionMode({ recording: options.recording ?? false })
  ]);
  const output = await script.run();

  console.log(output);
}
