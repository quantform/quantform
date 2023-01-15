import { join } from 'path';
import { lastValueFrom } from 'rxjs';

import build from '@lib/cli/build';
import { buildDirectory } from '@lib/cli/internal/workspace';
import { Dependency, Module } from '@lib/module';
import { withExecutionMode } from '@lib/useExecutionMode';

export default async function (name: string, options: any) {
  if (await build()) {
    return;
  }

  const script = await import(join(buildDirectory(), name));
  const dependencies = script.module2 as Dependency[];

  const module = new Module([withExecutionMode(false), ...dependencies]);

  const { act } = await module.awake();

  const output = await act(() => lastValueFrom(script.default(options)));

  console.log(output);
}
