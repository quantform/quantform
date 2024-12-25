import { useReplayOptions } from '@lib/replay/use-replay-options';
import { between } from '@lib/storage';
import { dependency } from '@lib/use-hash';
import { withMemo } from '@lib/with-memo';

import { useReplayStorage } from './use-replay-storage';

export const useReplayStorageBuffer = withMemo(<T>(dependencies: dependency[]) => {
  const { query } = useReplayStorage<T>(dependencies);
  const { from, to } = useReplayOptions();

  console.log(from, to);

  let page = new Array<{ timestamp: number; payload: T }>();
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

      page = await query({
        where: {
          timestamp: between(from, to)
        },
        limit: 10000,
        offset: count,
        orderBy: 'ASC'
      });

      count += page.length;
      completed = page.length == 0;
    }
  };
});
