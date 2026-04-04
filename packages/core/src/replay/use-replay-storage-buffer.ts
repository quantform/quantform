import { between } from '@lib/storage';
import { Timestamp } from '@lib/use-timestamp';

import { useReplayOptions } from './use-replay-options';
import { ReplayQuery } from './use-replay-storage-cursor';

export function useReplayStorageBuffer<T>(storage: ReplayQuery<T>) {
  const { from, to, limit } = useReplayOptions();

  let page: Array<{ timestamp: Timestamp<'ns'>; payload: T }> = [];
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
        limit,
        offset: count,
        orderBy: 'ASC'
      });

      count += page.length;
      completed = page.length === 0;
    }
  };
}
