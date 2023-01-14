import { useProvider } from '@lib/module';
import { Storage, StorageFactory, StorageFactoryToken } from '@lib/storage';
import { useHash } from '@lib/useHash';
import { useMemo } from '@lib/useMemo';

export function useStorage(dependencies: unknown[]): Storage {
  const key = useHash(dependencies);

  return useMemo(() => {
    const factory = useProvider<StorageFactory>(StorageFactoryToken);

    return factory.for(key);
  }, [useStorage, key]);
}
