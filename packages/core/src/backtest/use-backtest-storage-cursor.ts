import { Query, QueryObject } from '@lib/storage';
import { withMemo } from '@lib/with-memo';

import { useBacktestStorageBuffer } from './use-backtest-storage-buffer';

export interface BacktestQuery<V> {
  query(
    query: Query<QueryObject> & {
      where: { timestamp: { type: 'between'; min: number; max: number } };
    }
  ): Promise<{ timestamp: number; payload: V }[]>;
}

export const useBacktestStorageCursor = withMemo(() => {
  const cursors = Array.of<ReturnType<typeof useBacktestStorageBuffer<any>>>();

  return {
    get<T>(query: BacktestQuery<T>) {
      const buffer = useBacktestStorageBuffer<T>(query);

      cursors.push(buffer);

      return buffer;
    },

    async cursor() {
      let current: ReturnType<typeof useBacktestStorageBuffer<any>> | undefined;

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
});
