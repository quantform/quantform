import { between } from '@lib/storage';

import { useBacktestOptions } from './use-backtest-options';
import { BacktestQuery } from './use-backtest-storage-cursor';

export function useBacktestStorageBuffer<T>(storage: BacktestQuery<T>) {
  const { from, to } = useBacktestOptions();

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
}
