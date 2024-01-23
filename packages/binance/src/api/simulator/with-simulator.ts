import { map, Subject } from 'rxjs';

import { request } from '@lib/api/with-exchange-info-request';
import { useLogger, withMemo } from '@quantform/core';

import { Simulator, SimulatorEvent } from './simulator';
import { useSimulatorOptions } from './use-simulator-options';

export const withSimulator = withMemo(() => {
  const options = useSimulatorOptions();

  return request().pipe(
    map(it => {
      const simulator = Simulator.from({ type: 'created', what: { ...it, options } });
      const event = new Subject<SimulatorEvent>();
      const { error } = useLogger('withSimulator');

      return {
        apply<T>(effect: (simulator: Simulator) => T) {
          try {
            return effect(simulator);
          } catch (e) {
            error('error while applying effect', { error: e });

            throw e;
          } finally {
            simulator.flush().forEach(it => event.next(it));
          }
        },
        snapshot: () => simulator.snapshot(),
        event: event.asObservable()
      };
    })
  );
});
