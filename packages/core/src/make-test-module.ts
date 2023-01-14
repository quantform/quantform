import { Dependency, Module } from '@lib/module';
import { withCore } from '@lib/withCore';

export async function makeTestModule(dependencies: Dependency[]) {
  const module = new Module([...withCore(), ...dependencies]);

  const { act } = await module.awake();

  return {
    act,
    get: module.get.bind(module)
  };
}
