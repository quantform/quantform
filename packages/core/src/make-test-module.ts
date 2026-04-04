import { Observable } from 'rxjs';

import { Dependency, Module } from '@lib/module';

import { InMemoryStorageFactory, useStorageFactory } from './storage';
import { useExecutionMode } from './use-execution-mode';
import { ConsoleLoggerFactory, logger } from './use-logger';
import { useMemo } from './use-memo';

export async function makeTestModule(dependencies: Dependency[]) {
  const module = new Module([
    useMemo.options(),
    logger(new ConsoleLoggerFactory()),
    useExecutionMode.paperOptions({ recording: false }),
    useStorageFactory.options(new InMemoryStorageFactory()),
    ...dependencies
  ]);

  const { act } = await module.awake();

  return {
    act,
    get: module.get.bind(module)
  };
}

export function toArray<T>(observable: Observable<T>) {
  const array = Array.of<T | Error>();

  const clone = (it: T | Error): T | Error => {
    if (typeof it === 'symbol') {
      return it;
    }

    if (Array.isArray(it)) {
      return it.map(it => clone(it)) as T;
    }

    if (typeof it === 'object') {
      return { ...it };
    }

    return it;
  };

  observable.subscribe({
    next: it => array.push(clone(it)),
    error: it => array.push(it)
  });

  return array;
}

export type InferObservableType<T> = T extends Observable<infer U> ? U : never;
