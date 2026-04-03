import { defer, filter, map, Observable, Subject } from 'rxjs';

import { useMemo } from '@lib/use-memo';

import { useReplayOptions } from './use-replay-options';
import { useReplayStorageBuffer } from './use-replay-storage-buffer';
import { ReplayQuery, useReplayStorageCursor } from './use-replay-storage-cursor';

export function useReplayScheduler() {
  return useMemo(() => {
    const { from } = useReplayOptions();
    const { get, cursor } = useReplayStorageCursor();

    let timestamp = from;
    let stopAcquire = 1;
    let processing = false;

    const stream$ = new Subject<
      [
        ReturnType<typeof useReplayStorageBuffer<any>>,
        { timestamp: number; payload: any }
      ]
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
      if (processing) {
        return;
      }

      processing = true;

      while (stopAcquire === 0) {
        if (!(await processNext())) {
          break;
        }

        await new Promise(it => setImmediate(it));
      }

      processing = false;
    };

    const tryContinue = () => {
      if (stopAcquire === 0) {
        return;
      }

      stopAcquire--;

      if (stopAcquire === 0) {
        next();
      }
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

      watch<T>(query: ReplayQuery<T>): Observable<{ timestamp: number; payload: T }> {
        const storage = get<T>(query);

        return defer(() => {
          tryContinue();

          return stream$.pipe(
            filter(([cur]) => cur === storage),
            map(([, it]) => ({
              timestamp: it.timestamp,
              payload: it.payload as T
            }))
          );
        });
      }
    };
  }, [useReplayScheduler.name]);
}
