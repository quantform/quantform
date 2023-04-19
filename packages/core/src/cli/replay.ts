import { join } from 'path';
import { lastValueFrom } from 'rxjs';

import build from '@lib/cli/build';
import { buildDirectory } from '@lib/cli/internal/workspace';
import { core } from '@lib/core';
import { Dependency, Module } from '@lib/module';
import { replayOptions } from '@lib/replay';
import { replayExecutionMode } from '@lib/use-execution-mode';

export default async function (name: string, options: any) {
  if (await build()) {
    return;
  }

  const script = await import(join(buildDirectory(), name));
  const dependencies = script.module2 as Dependency[];

  const module = new Module([
    ...core(),
    ...dependencies,
    replayOptions({ from: 0, to: Number.MAX_VALUE }),
    replayExecutionMode()
  ]);

  const { act } = await module.awake();

  const output = await act(() => lastValueFrom(script.default(options)));

  console.log(output);
}
