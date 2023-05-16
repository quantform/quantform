import { join } from 'path';
import { lastValueFrom } from 'rxjs';

import { core } from '@lib/core';
import { Dependency, Module } from '@lib/module';

import { buildDirectory } from './workspace';

export class Script {
  constructor(
    private readonly name: string,
    private readonly dependencies: Dependency[]
  ) {}

  async runWhileFinished() {
    const script = await import(join(buildDirectory(), this.name));
    const module = new Module([...core(), ...script.onInstall(), ...this.dependencies]);

    const { act } = await module.awake();

    return await act(() => lastValueFrom(script.onAwake()));
  }
}
