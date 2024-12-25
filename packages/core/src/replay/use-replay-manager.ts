import { defer, filter, map, Observable, Subject } from 'rxjs';

import { dependency } from '@lib/use-hash';
import { withMemo } from '@lib/with-memo';

import { useReplayStorageBuffer } from './storage/use-replay-storage-buffer';
import { useReplayStorageCursor } from './storage/use-replay-storage-cursor';
import { useReplayOptions } from './use-replay-options';

export const useReplayManager = withMemo(() => {
  const { from } = useReplayOptions();
  const { get, cursor } = useReplayStorageCursor();

  let timestamp = from;
  let stopAcquire = 1;

  const stream$ = new Subject<
    [ReturnType<typeof useReplayStorageBuffer<any>>, { timestamp: number; payload: any }]
  >();

  const processNext = async () => {
    const storage = await cursor();

    if (!storage || !storage.peek()) {
      stream$.complete();

      return false;
    }

    const sample = storage.dequeue();

    timestamp = sample.timestamp;

    stream$.next([storage, sample]);

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
    watch<T>(dependencies: dependency[]): Observable<{ timestamp: number; payload: T }> {
      const storage = get<T>(dependencies);

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
