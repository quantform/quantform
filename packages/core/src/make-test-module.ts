import { Observable, tap } from 'rxjs';

import { core } from '@lib/core';
import { Dependency, Module } from '@lib/module';

export async function makeTestModule(dependencies: Dependency[]) {
  const module = new Module([...core(), ...dependencies]);

  const { act } = await module.awake();

  return {
    act,
    get: module.get.bind(module)
  };
}

type MockableFunction = (...args: any[]) => any;

export const mockedFunc = <Func extends MockableFunction>(mockedFunc: Func) =>
  mockedFunc as jest.MockedFunction<typeof mockedFunc>;

export function toArray<T>(observable: Observable<T>) {
  const array = Array.of<T>();

  const clone = (it: T): T => {
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

  observable.pipe(tap(it => array.push(clone(it)))).subscribe();

  return array;
}

export type InferObservableType<T> = T extends Observable<infer U> ? U : never;
