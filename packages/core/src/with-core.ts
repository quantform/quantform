import { Dependency } from '@lib/module';
import { InMemoryStorageFactory, StorageFactoryToken } from '@lib/storage';
import { provideMemo } from '@lib/use-memo';

import { withExecutionPaper } from './use-execution-mode';

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
