import { useContext } from '@lib/module';
import { Storage, StorageFactory, StorageFactoryToken } from '@lib/storage';
import { dependency, useHash } from '@lib/use-hash';
import { useMemo } from '@lib/use-memo';

export function useStorage(dependencies: dependency[]): Storage {
  const key = useHash(dependencies);

  return useMemo(() => {
    const factory = useContext<StorageFactory>(StorageFactoryToken);

    return factory.for(key);
  }, [useStorage.name, key]);
}
