import { Query, QueryObject } from '@lib/storage';
import { useMemo } from '@lib/use-memo';

import { useReplayStorageBuffer } from './use-replay-storage-buffer';

export interface ReplayQuery<V> {
  query(
    query: Query<QueryObject> & {
      where: { timestamp: { type: 'between'; min: number; max: number } };
    }
  ): Promise<{ timestamp: number; payload: V }[]>;
}

export function useReplayStorageCursor() {
  return useMemo(() => {
    const cursors = Array.of<ReturnType<typeof useReplayStorageBuffer<any>>>();

    return {
      get<T>(query: ReplayQuery<T>) {
        const buffer = useReplayStorageBuffer<T>(query);

        cursors.push(buffer);

        return buffer;
      },

      async cursor() {
        let current: ReturnType<typeof useReplayStorageBuffer<any>> | undefined;

        for (const cursor of cursors) {
          if (cursor.completed()) {
            continue;
          }

          if (cursor.size() == 0) {
            await cursor.fetchNextPage();
          }

          if (cursor.peek()) {
            if (!current || current.peek().timestamp > cursor.peek().timestamp) {
              current = cursor;
            }
          }
        }

        return current;
      }
    };
  }, [useReplayStorageCursor.name]);
}
