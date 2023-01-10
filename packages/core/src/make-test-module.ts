import { Module, ModuleDefinition } from '@lib/module';
import { provideExecutionMode } from '@lib/useFake';
import { provideMemo } from '@lib/useMemo';

export async function makeTestModule(definition: ModuleDefinition) {
  const module = new Module({
    dependencies: [provideMemo(), provideExecutionMode(false), ...definition.dependencies]
  });

  await module.awake();

  return module;
}
