import { Observable } from 'rxjs';

import { InstrumentSelector } from '@lib/component';
import { useExecutionMode } from '@lib/useExecutionMode';
import { useMemo } from '@lib/useMemo';
import { useSampler } from '@lib/useSampler';

export function useSampleStreamer() {
  return useMemo(() => {
    const timestamp = 0;
    let stopAcquire = 1;

    const stop = () => stopAcquire++;
    const tryContinue = () => {
      if (stopAcquire == 0) {
        return;
      }

      stopAcquire = Math.max(0, stopAcquire - 1);

      if (stopAcquire != 0) {
        return;
      }
    };

    return {
      timestamp,
      stop,
      tryContinue
    };
  }, [useSampleStreamer.name]);
}

export function useSampleStreaming<T>(input: Observable<T>, dependencies: unknown[]) {
  const { isReal } = useExecutionMode();

  if (isReal) {
    return input;
  }

  const { peek } = useSampleCursor(dependencies);
}

function useSampleCursor<T extends { timestamp: number }>(dependencies: unknown[]) {
  return useMemo(() => {
    const { read } = useSampler<T>(dependencies);
    let page = new Array<T>();
    let index = 0;

    const peek = () => page[index];
    const dequeue = () => page[index++];
    const fetchNextPage = async (from: number, to: number) => {
      index = 0;
      page = await read({ from, to, count: 10000 });
    };

    return {
      peek,
      dequeue,
      fetchNextPage
    };
  }, [useSampleCursor.name, ...dependencies]);
}
