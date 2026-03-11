import { defer, filter, map, Observable, Subject } from 'rxjs';

import { withMemo } from '@lib/with-memo';

import { useBacktestOptions } from './use-backtest-options';
import { useBacktestStorageBuffer } from './use-backtest-storage-buffer';
import { BacktestQuery, useBacktestStorageCursor } from './use-backtest-storage-cursor';

export const useBacktestScheduler = withMemo(() => {
  const { from } = useBacktestOptions();
  const { get, cursor } = useBacktestStorageCursor();

  let timestamp = from;
  let stopAcquire = 1;
  let processing = false;

  const stream$ = new Subject<
    [
      ReturnType<typeof useBacktestStorageBuffer<any>>,
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

    watch<T>(query: BacktestQuery<T>): Observable<{ timestamp: number; payload: T }> {
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
});
