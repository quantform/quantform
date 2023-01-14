import { Dependency } from '@lib/module';
import { InMemoryStorageFactory, StorageFactoryToken } from '@lib/storage';
import { provideExecutionMode } from '@lib/useFake';
import { provideMemo } from '@lib/useMemo';

export function withCore(): Dependency[] {
  return [
    provideMemo(),
    provideExecutionMode(false),
    {
      provide: StorageFactoryToken,
      useClass: InMemoryStorageFactory
    }
  ];
}
