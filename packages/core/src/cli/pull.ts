import build from '@lib/cli/build';
import { idleExecutionMode } from '@lib/use-execution-mode';

import { Script } from './internal/script';

export default async function (name: string, instrument: string, options: any) {
  if (await build()) {
    return;
  }

  const script = new Script(name, [idleExecutionMode()]);
  //const output = await script.run();

  //console.log(output);
}
