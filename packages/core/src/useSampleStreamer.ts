import { map, Observable, Subject } from 'rxjs';

import { useExecutionMode } from '@lib/useExecutionMode';
import { useMemo } from '@lib/useMemo';
import { useSampler } from '@lib/useSampler';

export function useSampleStreamer() {
  return useMemo(() => {
    let timestamp = 0;
    let stopAcquire = 1;
    const subscriptions = Array.of<SampleCursor>();
    const stream$ = new Subject<{ timestamp: number }>();

    const subscribe = (dependencies: unknown[]) => {
      const cursor = useSampleCursor(dependencies);

      if (!subscriptions.includes(cursor)) {
        subscriptions.push(cursor);
      }

      return stream$.asObservable();
    };

    const current = async () => {
      for (const cursor of subscriptions) {
        if (cursor.size() == 0 && !cursor.completed) {
          await cursor.fetchNextPage(timestamp, 1000);
        }
      }

      return subscriptions
        .sort((lhs, rhs) => (lhs?.peek()?.timestamp ?? 0) - (rhs?.peek()?.timestamp ?? 0))
        .find(() => true);
    };

    const processNext = async () => {
      const cursor = await current();

      if (!cursor) {
        return false;
      }

      const sample = cursor.dequeue();

      if (!sample) {
        stream$.complete();

        return false;
      }

      timestamp = sample.timestamp;

      stream$.next(sample);

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
      timestamp,
      stop,
      tryContinue,
      subscribe
    };
  }, [useSampleStreamer.name]);
}

export function useSampleStreaming<T>(input: Observable<T>, dependencies: unknown[]) {
  const { isReal } = useExecutionMode();

  if (isReal) {
    return input;
  }

  const { subscribe } = useSampleStreamer();

  return subscribe(dependencies).pipe(map(it => it as unknown as T));
}

type SampleCursor = Awaited<ReturnType<typeof useSampleCursor>>;

function useSampleCursor<T extends { timestamp: number }>(dependencies: unknown[]) {
  return useMemo(() => {
    const { read } = useSampler<T>(dependencies);
    let page = new Array<T>();
    let index = 0;
    let completed = false;

    const size = () => page.length;
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
