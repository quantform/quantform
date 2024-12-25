import { Dependency } from '@lib/module';
import { useMemo } from '@lib/use-memo';

import { InMemoryStorageFactory } from './storage';
import { useStorageFactory } from './storage/use-storage-factory';
import { useExecutionMode } from './use-execution-mode';

export function core(): Dependency[] {
  return [
    useMemo.options(),
    useExecutionMode.paperOptions({ recording: false }),
    useStorageFactory.options(new InMemoryStorageFactory())
  ];
}
