import { Module, ModuleDefinition } from '@lib/module';
import { provideExecutionMode } from '@lib/useFake';
import { provideMemo } from '@lib/useMemo';

export async function makeTestModule(definition: ModuleDefinition) {
  const module = new Module({
    dependencies: [provideMemo(), provideExecutionMode(false), ...definition.dependencies]
  });

  const { act } = await module.awake();

  return {
    act,
    get: module.get.bind(module)
  };
}
