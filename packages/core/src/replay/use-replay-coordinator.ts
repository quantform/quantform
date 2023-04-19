import { defer, filter, map, Subject } from 'rxjs';

import { dependency } from '@lib/use-hash';
import { useMemo } from '@lib/use-memo';

import { between } from '..';
import { useReplayOptions } from './use-replay-options';
import { useReplayReader } from './use-replay-reader';

export function useReplayCoordinator() {
  const options = useReplayOptions();

  return useMemo(() => {
    let timestamp = options.from;
    let stopAcquire = 1;
    let sequence = 0;
    const subscriptions = Array.of<SampleCursor>();
    const stream$ = new Subject<[SampleCursor, { timestamp: number }]>();

    const subscribe = (dependencies: dependency[]) => {
      const cursor = useSampleCursor(dependencies);

      if (!subscriptions.includes(cursor)) {
        subscriptions.push(cursor);
      }

      return defer(() => {
        tryContinue();

        return stream$.pipe(
          filter(([cur]) => cur === cursor),
          map(([, it]) => it)
        );
      });
    };

    const current = async () => {
      let next: SampleCursor | undefined;

      for (const cursor of subscriptions) {
        if (cursor.size() == 0 && !cursor.completed) {
          await cursor.fetchNextPage(timestamp, options.to + 1);
        }

        if (cursor.peek()) {
          if (!next || next.peek().timestamp > cursor.peek().timestamp) {
            next = cursor;
          }
        }
      }

      return next;
    };

    const processNext = async () => {
      const cursor = await current();

      if (!cursor || !cursor.peek()) {
        stream$.complete();

        return false;
      }

      const sample = cursor.dequeue();

      timestamp = sample.timestamp;
      sequence++;

      stream$.next([cursor, sample]);

      return true;
    };

    const next = async () => {
      if (await processNext()) {
        if (stopAcquire === 0) {
          setImmediate(next);
        }
      }
    };

    const stop = () => stopAcquire++;
    const tryContinue = () => {
      if (stopAcquire == 0) {
        return;
      }

      stopAcquire = Math.max(0, stopAcquire - 1);

      if (stopAcquire != 0) {
        return;
      }

      next();
    };

    return {
      timestamp: () => timestamp,
      stop,
      tryContinue,
      subscribe
    };
  }, [useReplayCoordinator.name]);
}

type SampleCursor = Awaited<ReturnType<typeof useSampleCursor>>;

function useSampleCursor<T>(dependencies: dependency[]) {
  return useMemo(() => {
    const read = useReplayReader<T>(dependencies);
    let page = new Array<{ timestamp: number; payload: T }>();
    let index = 0;
    let completed = false;

    const size = () => page.length - index;
    const peek = () => page[index];
    const dequeue = () => page[index++];
    const fetchNextPage = async (from: number, to: number) => {
      if (completed) {
        return;
      }

      index = 0;

      page = await read({
        where: {
          timestamp: between(from, to)
        },
        limit: 10000
      });
      completed = page.length == 0;
    };

    return {
      size,
      peek,
      dequeue,
      fetchNextPage,
      completed
    };
  }, [useSampleCursor.name, ...dependencies]);
}
