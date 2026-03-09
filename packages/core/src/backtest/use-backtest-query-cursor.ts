import { withMemo } from '@lib/with-memo';

import { BacktestStorage } from './use-backtest';
import { useBacktestQueryBuffer } from './use-backtest-query-buffer';

export const useBacktestQueryCursor = withMemo(() => {
  const cursors = Array.of<ReturnType<typeof useBacktestQueryBuffer<any>>>();

  return {
    get<T>(query: BacktestStorage<T>) {
      const buffer = useBacktestQueryBuffer<T>(query);

      cursors.push(buffer);

      return buffer;
    },

    async cursor() {
      let current: ReturnType<typeof useBacktestQueryBuffer<any>> | undefined;

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
