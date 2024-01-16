import { Observable, take } from 'rxjs';

import { withMemo } from '@quantform/core';

import { SimulatorWithEvent, WithEventResponse } from './simulator';
import { useSimulator } from './use-simulator';

export const withSimulator = withMemo(() => {
  const { apply, event } = useSimulator();

  return {
    apply<
      T extends (...args: any) => Observable<ReturnType<T>>,
      K extends string,
      Y extends SimulatorWithEvent
    >(command: Y): Observable<WithEventResponse<T, K>['payload']> {
      return new Observable<WithEventResponse<T, K>['payload']>(subscriber => {
        const subscription = event.subscribe({
          next: it => {
            if (it.correlationId !== command.correlationId || it.type === command.type) {
              return;
            }

            subscriber.next((it as WithEventResponse<T, K>).payload);
          },
          error: e => subscriber.error(e),
          complete: () => subscriber.complete()
        });

        apply(command);

        return () => subscription.unsubscribe();
      }).pipe(take(1));
    }
  };
});
