import { Subject } from 'rxjs';

import { useLogger, withMemo } from '@quantform/core';

import { BinanceSimulator, SimulatorEvent } from './simulator';
import { useSimulatorOptions } from './use-simulator-options';

export const useSimulator = withMemo(() => {
  const options = useSimulatorOptions();
  const aggregate = new BinanceSimulator(options);
  const { error } = useLogger('useBinanceSimulator');

  const event = new Subject<SimulatorEvent>();

  return {
    event: event.asObservable(),
    snapshot() {
      return aggregate.snapshot();
    },
    apply(e: SimulatorEvent) {
      try {
        aggregate.apply(e);
      } catch (e) {
        error('error while applying event', { event: e, error: e });

        throw e;
      }

      aggregate.flush().forEach(it => event.next(it));
    }
  };
});
