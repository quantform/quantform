import { Observable, Subject } from 'rxjs';

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

export function mockSubject<
  T extends jest.FunctionProperties<Required<T>>,
  M extends keyof jest.FunctionProperties<Required<T>>
>(object: T, method: M) {
  const subject = new Subject<
    InferObservableType<ReturnType<jest.FunctionProperties<Required<T>>[M]>>
  >();

  jest
    .spyOn<T, M>(object, method)
    .mockReturnValue(
      subject.asObservable() as ReturnType<jest.FunctionProperties<Required<T>>[M]>
    );

  return subject;
}
