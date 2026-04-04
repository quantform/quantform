import { dependency, useHash } from '@lib/use-hash';
import { useMemo } from '@lib/use-memo';

import { useStorageFactory } from './use-storage-factory';

export function useStorage(dependencies: dependency[]) {
  return useMemo(() => {
    const key = useHash(dependencies);
    const factory = useStorageFactory();

    return factory.for(key);
  }, [dependencies]);
}
