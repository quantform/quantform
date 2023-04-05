import { firstValueFrom, Observable, skipWhile, tap } from 'rxjs';

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

export async function expectSequence(input: Observable<any>, sequence: any[]) {
  const seq = sequence.reverse();

  await firstValueFrom(
    input.pipe(
      tap(it => expect(it).toEqual(seq.pop())),
      skipWhile(() => seq.length != 0)
    )
  );

  await expect(seq.length).toEqual(0);
}

export function toArray<T>(observable: Observable<T>) {
  const array = Array.of<T>();

  observable
    .pipe(tap(it => array.push(typeof it === 'symbol' ? it : { ...it })))
    .subscribe();

  return array;
}

export type InferObservableType<T> = T extends Observable<infer U> ? U : never;
