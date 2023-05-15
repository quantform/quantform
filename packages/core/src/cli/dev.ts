import build from '@lib/cli/build';
import { paperExecutionMode } from '@lib/use-execution-mode';

import { Script } from './internal/script';

export default async function (name: string, options: any) {
  if (await build()) {
    return;
  }

  const script = new Script(name, [paperExecutionMode({ recording: false })]);
  const output = await script.runWhileFinished();

  console.log(output);
}
