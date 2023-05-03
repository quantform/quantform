import { filter, finalize, Observable } from 'rxjs';

import { withMemo } from '@lib/with-memo';
import { dependency, useHash } from '@lib/use-hash';

export const useExclusiveLock = withMemo(() => {
  const locking = {} as Record<string, boolean>;
  const acquire = (dependencies: dependency[]) => {
    const hash = useHash(dependencies);

    if (locking[hash]) {
      throw Error('nested locks not allowed');
    }

    locking[hash] = true;
  };

  const release = (dependencies: dependency[]) => {
    const hash = useHash(dependencies);

    if (!locking[hash]) {
      throw Error('nested locks not allowed');
    }

    locking[hash] = false;
  };

  const alreadyAcquired = (dependencies: dependency[]) => {
    const hash = useHash(dependencies);

    return locking[hash] == true;
  };

  return {
    acquire,
    release,
    alreadyAcquired
  };
});

export function exclusive<T>(dependencies: dependency[]) {
  return (input: Observable<T>) => {
    const { acquire, release, alreadyAcquired } = useExclusiveLock();

    acquire(dependencies);

    return input.pipe(
      filter(() => alreadyAcquired(dependencies)),
      finalize(() => release(dependencies))
    );
  };
}
