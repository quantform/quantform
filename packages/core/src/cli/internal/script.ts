import { join } from 'path';
import {
  catchError,
  finalize,
  firstValueFrom,
  forkJoin,
  fromEvent,
  last,
  merge,
  of,
  switchMap,
  take
} from 'rxjs';

import { core } from '@lib/core';
import { Dependency, Module } from '@lib/module';
import { whenReplayFinished } from '@lib/replay';
import { strategy } from '@lib/strategy';

import { buildDirectory } from './workspace';

export class Script {
  constructor(
    private readonly name: string,
    private readonly dependencies: Dependency[]
  ) {}

  async run() {
    const script = await import(join(buildDirectory(), this.name));

    const { dependencies, description } = script.default as ReturnType<typeof strategy>;

    const module = new Module([...core(), ...dependencies, ...this.dependencies]);

    const { act } = await module.awake();

    return await act(() => {
      process.stdin.resume();

      return firstValueFrom(
        merge(
          forkJoin(description.before.map(before => before()))
            .pipe(
              switchMap(() =>
                forkJoin(description.behavior.map(behavior => behavior())).pipe(last())
              )
            )
            .pipe(last()),
          whenReplayFinished().pipe(last()),
          fromEvent(process, 'exit'),
          fromEvent(process, 'SIGINT'),
          fromEvent(process, 'SIGUSR1'),
          fromEvent(process, 'SIGUSR2'),
          fromEvent(process, 'uncaughtException')
        ).pipe(
          catchError(e => {
            console.error(e);

            return of(e);
          }),
          take(1),
          switchMap(
            it => forkJoin(description.after.map(after => after())).pipe(last()) ?? of(it)
          ),
          finalize(() => process.exit(0))
        )
      );
    });
  }
}
