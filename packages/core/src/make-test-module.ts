import { Module, ModuleDefinition } from '@lib/module';
import { withCore } from '@lib/withCore';

export async function makeTestModule(definition: ModuleDefinition) {
  const module = new Module({
    dependencies: [...withCore().dependencies, ...definition.dependencies]
  });

  const { act } = await module.awake();

  return {
    act,
    get: module.get.bind(module)
  };
}
