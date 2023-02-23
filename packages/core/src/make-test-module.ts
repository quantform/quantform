import { lastValueFrom, Observable, takeWhile, tap } from 'rxjs';

import { Dependency, Module } from '@lib/module';
import { withCore } from '@lib/with-core';

export async function makeTestModule(dependencies: Dependency[]) {
  const module = new Module([...withCore(), ...dependencies]);

  const { act } = await module.awake();

  return {
    act,
    get: module.get.bind(module)
  };
}

type MockableFunction = (...args: any[]) => any;

export const mockedFunc = <Func extends MockableFunction>(mockedFunc: Func) =>
  mockedFunc as jest.MockedFunction<typeof mockedFunc>;

export async function expectSequenceEquals(input: Observable<any>, sequence: any[]) {
  return lastValueFrom(
    input.pipe(
      takeWhile(() => sequence.length > 0),
      tap(it => expect(it).toEqual(sequence.pop()))
    )
  );
}
