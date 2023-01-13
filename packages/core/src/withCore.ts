import { ModuleDefinition } from '@lib/module';
import { provideExecutionMode } from '@lib/useFake';
import { provideMemo } from '@lib/useMemo';

export function withCore(): ModuleDefinition {
  return {
    dependencies: [provideMemo(), provideExecutionMode(false)]
  };
}
