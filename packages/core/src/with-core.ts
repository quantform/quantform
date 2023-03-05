import { Dependency } from '@lib/module';
import { InMemoryStorageFactory, StorageFactoryToken } from '@lib/storage';
import { MemoModule } from '@lib/use-memo';

import { withExecutionPaper } from './use-execution-mode';

export function withCore(): Dependency[] {
  return [
    MemoModule(),
    withExecutionPaper({ recording: false }),
    {
      provide: StorageFactoryToken,
      useClass: InMemoryStorageFactory
    }
  ];
}
