import { Observable, tap } from 'rxjs';

import { useExecutionMode } from '@quantform/core';

import { SimulatorWhenEvent } from './simulator';
import { useSimulator } from './use-simulator';

export function whenSimulator<
  E extends SimulatorWhenEvent['type'],
  P extends Extract<SimulatorWhenEvent, { type: E }>,
  K extends (...args: P['args']) => Observable<P['payload']>
>(input: K, type: E, args: Parameters<K>): Observable<P['payload']> {
  const { isSimulation } = useExecutionMode();

  if (!isSimulation) {
    return input(...args);
  }

  const { apply } = useSimulator();

  return input(...args).pipe(
    tap(payload => apply({ type, args: args as any, payload: payload as any }))
  );
}
