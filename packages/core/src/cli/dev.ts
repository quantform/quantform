import { join } from 'path';
import { lastValueFrom } from 'rxjs';

import build from '@lib/cli/build';
import { buildDirectory } from '@lib/cli/internal/workspace';
import { Module, ModuleDefinition } from '@lib/module';
import { provideExecutionMode } from '@lib/useFake';

export default async function (name: string, options: any) {
  if (await build()) {
    return;
  }

  const script = await import(join(buildDirectory(), name));
  const declaration = script.module2 as ModuleDefinition;

  const module = new Module({
    dependencies: [provideExecutionMode(false), ...declaration.dependencies]
  });

  const { act } = await module.awake();

  const output = await act(() => lastValueFrom(script.default(options)));

  console.log(output);
}
