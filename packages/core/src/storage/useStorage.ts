import { useProvider } from '@lib/module';
import { Storage, StorageFactory, StorageFactoryToken } from '@lib/storage';
import { useMemo } from '@lib/useMemo';

export function useStorage(name: string): Storage {
  return useMemo(() => {
    const factory = useProvider<StorageFactory>(StorageFactoryToken);

    return factory.for(name);
  }, [useStorage, name]);
}
