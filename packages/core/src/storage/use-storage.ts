import { dependency, useHash } from '@lib/use-hash';
import { withMemo } from '@lib/with-memo';

import { useStorageFactory } from './use-storage-factory';

export const useStorage = withMemo((dependencies: dependency[]) => {
  const key = useHash(dependencies);
  const factory = useStorageFactory();

  return factory.for(key);
});
