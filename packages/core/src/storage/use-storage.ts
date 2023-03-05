import { useContext } from '@lib/module';
import { Storage, StorageFactory, StorageFactoryToken } from '@lib/storage';
import { useHash } from '@lib/use-hash';
import { useMemo } from '@lib/use-memo';

export function useStorage(dependencies: unknown[]): Storage {
  const key = useHash(dependencies);

  return useMemo(() => {
    const factory = useContext<StorageFactory>(StorageFactoryToken);

    return factory.for(key);
  }, [useStorage, key]);
}
