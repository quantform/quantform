import { useContext } from '@lib/module';
import { StorageFactory, StorageFactoryToken } from '@lib/storage';
import { use } from '@lib/use';
import { dependency, useHash } from '@lib/use-hash';

export const useStorage = use((dependencies: dependency[]) => {
  const key = useHash(dependencies);
  const factory = useContext<StorageFactory>(StorageFactoryToken);

  return factory.for(key);
});
