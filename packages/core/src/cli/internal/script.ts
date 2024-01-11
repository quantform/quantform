import { join } from 'path';
import {
  finalize,
  firstValueFrom,
  fromEvent,
  last,
  merge,
  of,
  switchMap,
  take
} from 'rxjs';

import { core } from '@lib/core';
import { Dependency, Module } from '@lib/module';

import { buildDirectory } from './workspace';

export class Script {
  constructor(
    private readonly name: string,
    private readonly dependencies: Dependency[]
  ) {}

  async run() {
    const script = await import(join(buildDirectory(), this.name));
    const module = new Module([...core(), ...script.onInstall(), ...this.dependencies]);

    const { act } = await module.awake();

    return await act(() => {
      process.stdin.resume();

      return firstValueFrom(
        merge(
          script.onAwake().pipe(last()),
          fromEvent(process, 'exit'),
          fromEvent(process, 'SIGINT'),
          fromEvent(process, 'SIGUSR1'),
          fromEvent(process, 'SIGUSR2'),
          fromEvent(process, 'uncaughtException')
        ).pipe(
          take(1),
          switchMap(it => script.onExit() ?? of(it)),
          finalize(() => process.exit(0))
        )
      );
    });
  }
}
