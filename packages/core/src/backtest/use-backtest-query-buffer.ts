import { useReplayOptions } from '@lib/replay';
import { between } from '@lib/storage';
import { withMemo } from '@lib/with-memo';

import { BacktestStorage } from './use-backtest';

export const useBacktestQueryBuffer = withMemo(<T>(storage: BacktestStorage<T>) => {
  const { from, to } = useReplayOptions();

  let page: Array<{ timestamp: number; payload: T }> = [];
  let index = 0;
  let completed = false;
  let count = 0;

  return {
    size() {
      return page.length - index;
    },

    peek() {
      return page[index];
    },

    dequeue() {
      return page[index++];
    },

    completed() {
      return completed;
    },

    async fetchNextPage() {
      if (completed) {
        return;
      }

      index = 0;

      page = await storage.query({
        where: { timestamp: between(from, to) },
        limit: 10000,
        offset: count,
        orderBy: 'ASC'
      });

      count += page.length;
      completed = page.length === 0;
    }
  };
});
