import { defer, filter, map, Subject } from 'rxjs';

import { useMemo } from '@lib/useMemo';
import { useReplayOptions } from '@lib/useReplayOptions';
import { useSampler } from '@lib/useSampler';

export function useReplayController() {
  const options = useReplayOptions();

  return useMemo(() => {
    let timestamp = options.from;
    let stopAcquire = 1;
    let sequence = 0;
    const subscriptions = Array.of<SampleCursor>();
    const stream$ = new Subject<[SampleCursor, { timestamp: number }]>();

    const subscribe = (dependencies: unknown[]) => {
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
  }, [useReplayController.name]);
}

type SampleCursor = Awaited<ReturnType<typeof useSampleCursor>>;

function useSampleCursor<T>(dependencies: unknown[]) {
  return useMemo(() => {
    const { read } = useSampler<T>(dependencies);
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

      page = await read({ from, to, count: 10000 });
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
