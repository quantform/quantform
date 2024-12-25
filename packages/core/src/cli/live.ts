import build from '@lib/cli/build';
import { useSession } from '@lib/session';
import { useExecutionMode } from '@lib/use-execution-mode';

import { Script } from './internal/script';

export default async function (
  name: string,
  options: { id?: string; recording?: boolean }
) {
  if (await build()) {
    return;
  }

  const script = new Script(name, [
    useSession.options({ id: options.id ?? Date.now().toString() }),
    useExecutionMode.liveOptions({ recording: options.recording ?? false })
  ]);
  const output = await script.run();

  console.log(output);
}
