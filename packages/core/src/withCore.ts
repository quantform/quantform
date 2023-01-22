import { Dependency } from '@lib/module';
import { InMemoryStorageFactory, StorageFactoryToken } from '@lib/storage';
import { provideMemo } from '@lib/useMemo';

import { withExecutionPaper } from './useExecutionMode';

export function withCore(): Dependency[] {
  return [
    provideMemo(),
    withExecutionPaper({ recording: false }),
    {
      provide: StorageFactoryToken,
      useClass: InMemoryStorageFactory
    }
  ];
}
