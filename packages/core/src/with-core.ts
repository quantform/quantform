import { Dependency } from '@lib/module';
import { memo } from '@lib/use-memo';

import { InMemoryStorageFactory } from './storage';
import { storage } from './storage/use-storage-factory';
import { paperExecutionMode } from './use-execution-mode';

export function withCore(): Dependency[] {
  return [
    memo(),
    paperExecutionMode({ recording: false }),
    storage(new InMemoryStorageFactory())
  ];
}
