import { use } from '@lib/use';
import { dependency, useHash } from '@lib/use-hash';

import { useStorageFactory } from './use-storage-factory';

export const useStorage = use((dependencies: dependency[]) => {
  const key = useHash(dependencies);
  const factory = useStorageFactory();

  return factory.for(key);
});
