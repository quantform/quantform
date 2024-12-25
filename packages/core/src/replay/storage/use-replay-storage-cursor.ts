import { dependency, useHash } from '@lib/use-hash';
import { useLogger } from '@lib/use-logger';
import { withMemo } from '@lib/with-memo';

import { useReplayStorageBuffer } from './use-replay-storage-buffer';

export const useReplayStorageCursor = withMemo(() => {
  const { info } = useLogger('useReplayStorageCursor');
  const storages = Array.of<ReturnType<typeof useReplayStorageBuffer<any>>>();

  return {
    get<T>(dependencies: dependency[]) {
      const storage = useReplayStorageBuffer<T>(dependencies);

      if (!storages.includes(storage)) {
        info('opening a new replay buffer', useHash(dependencies));
        storages.push(storage);
      }

      return storage;
    },
    async cursor() {
      let current: ReturnType<typeof useReplayStorageBuffer<any>> | undefined;

      for (const storage of storages) {
        if (storage.completed()) {
          continue;
        }

        if (storage.size() == 0) {
          await storage.fetchNextPage();
        }

        if (storage.peek()) {
          if (!current || current.peek().timestamp > storage.peek().timestamp) {
            current = storage;
          }
        }
      }

      return current;
    }
  };
});
