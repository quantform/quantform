import { join } from 'path';
import { catchError, finalize, firstValueFrom, fromEvent, merge, of, take } from 'rxjs';

import { AppStart } from '@lib/app';
import { Dependency } from '@lib/module';

import { buildDirectory } from './workspace';

export class Script {
  constructor(
    private readonly filename: string,
    private readonly dependencies: Dependency[]
  ) {}

  async run() {
    const script = await import(join(buildDirectory(), this.filename));

    const { run } = script.default as AppStart<unknown>;

    process.stdin.resume();

    return firstValueFrom(
      merge(
        run(this.dependencies),
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
        finalize(() => process.exit(0))
      )
    );
  }
}
