import { defaultIfEmpty, firstValueFrom, last, Observable } from 'rxjs';

import { Dependency, Module } from '@lib/module';

import { InMemoryStorageFactory, useStorageFactory } from './storage';
import { useExecutionMode } from './use-execution-mode';
import { ConsoleLoggerFactory, logger } from './use-logger';
import { useMemo } from './use-memo';

export type AppStart<T> = {
  run: (dependencies: Dependency[]) => Promise<T | undefined>;
};

export type AppHandle = {
  use: AppUse;
  start: <T>(strategy: () => Observable<T>) => AppStart<T | undefined>;
};

export type AppUse = (module: Dependency | Dependency[]) => AppHandle;

export function app(): AppHandle {
  const deps: Dependency[] = [
    useMemo.options(),
    logger(new ConsoleLoggerFactory()),
    useExecutionMode.paperOptions({ recording: false }),
    useStorageFactory.options(new InMemoryStorageFactory())
  ];

  const start = <T>(strategy: () => Observable<T>): AppStart<T> => ({
    async run(dependencies: Dependency[] = []) {
      const module = new Module([...deps, ...dependencies]);

      const { act } = await module.awake();

      return await act(() =>
        firstValueFrom(strategy().pipe(defaultIfEmpty(undefined), last()))
      );
    }
  });

  const use = (module: Dependency | Dependency[]) => {
    if (Array.isArray(module)) {
      deps.push(...module);
    } else {
      deps.push(module);
    }

    return { use, start };
  };

  return { use, start };
}
