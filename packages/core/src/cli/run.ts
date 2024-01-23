import build from '@lib/cli/build';
import { liveExecutionMode } from '@lib/use-execution-mode';

import { Script } from './internal/script';

export default async function (name: string, options: any) {
  if (await build()) {
    return;
  }

  const script = new Script(name, [liveExecutionMode({ recording: true })]);
  const output = await script.run();

  console.log(output);
}
