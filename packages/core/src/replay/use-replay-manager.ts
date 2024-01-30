import { defer, filter, map, Observable, Subject } from 'rxjs';

import { dependency, useHash } from '@lib/use-hash';
import { useLogger } from '@lib/use-logger';
import { withMemo } from '@lib/with-memo';

import { useReplayOptions } from './use-replay-options';
import { useReplayStorageBuffer } from './use-replay-storage-buffer';

export const useReplayManager = withMemo(() => {
  const { from, to } = useReplayOptions();
  const { info } = useLogger('useReplayManager');

  let timestamp = from;
  let stopAcquire = 1;
  const subscriptions = Array.of<ReturnType<typeof useReplayStorageBuffer<any>>>();

  const stream$ = new Subject<
    [ReturnType<typeof useReplayStorageBuffer<any>>, { timestamp: number; payload: any }]
  >();

  const getNextStorage = async () => {
    let next: ReturnType<typeof useReplayStorageBuffer<any>> | undefined;

    for (const cursor of subscriptions) {
      if (cursor.size() == 0 && !cursor.completed()) {
        await cursor.fetchNextPage(timestamp, to + 1);
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
    const cursor = await getNextStorage();

    if (!cursor || !cursor.peek()) {
      stream$.complete();

      return false;
    }

    const sample = cursor.dequeue();

    timestamp = sample.timestamp;

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
    stream: stream$.asObservable(),
    timestamp() {
      return timestamp;
    },
    stop() {
      stopAcquire++;
    },
    tryContinue,
    when<T>(dependencies: dependency[]): Observable<{ timestamp: number; payload: T }> {
      const storage = useReplayStorageBuffer<T>(dependencies);

      if (!subscriptions.includes(storage)) {
        info('subscribing to replay', useHash(dependencies));
        subscriptions.push(storage);
      }

      return defer(() => {
        tryContinue();

        return stream$.pipe(
          filter(([cur]) => cur === storage),
          map(([, it]) => ({ timestamp: it.timestamp, payload: it.payload as T }))
        );
      });
    }
  };
});
