import { join } from 'path';
import { lastValueFrom } from 'rxjs';

import build from '@lib/cli/build';
import { buildDirectory } from '@lib/cli/internal/workspace';
import { core } from '@lib/core';
import { Module } from '@lib/module';
import { paperExecutionMode } from '@lib/use-execution-mode';

export default async function (name: string, options: any) {
  if (await build()) {
    return;
  }

  const script = await import(join(buildDirectory(), name));

  const module = new Module([
    ...core(),
    ...script.dependency,
    paperExecutionMode({ recording: false })
  ]);

  const { act } = await module.awake();

  const output = await act(() => lastValueFrom(script.default()));

  console.log(output);
}
