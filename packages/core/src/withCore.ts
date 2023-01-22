import { Dependency } from '@lib/module';
import { InMemoryStorageFactory, StorageFactoryToken } from '@lib/storage';
import { withExecutionMode } from '@lib/useExecutionMode';
import { provideMemo } from '@lib/useMemo';

export function withCore(): Dependency[] {
  return [
    provideMemo(),
    withExecutionMode({ mode: 'PAPER', recording: false }),
    {
      provide: StorageFactoryToken,
      useClass: InMemoryStorageFactory
    }
  ];
}
