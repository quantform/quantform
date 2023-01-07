import { BehaviorSubject, map, Observable } from 'rxjs';

import { useMemo } from '@lib/useMemo';

export function useStore<T extends { timestamp: number }>(
  initialState: T,
  dependencies: unknown[]
) {
  return useMemo(() => {
    const state = new BehaviorSubject<T>(initialState);

    return {
      snapshot() {
        return state.getValue();
      },

      setState(newState: Partial<T>) {
        const { timestamp } = state.getValue();
        const snapshot = Object.assign(state.getValue(), newState);

        if (timestamp != snapshot.timestamp) {
          state.next(snapshot);
        }
      },

      select<V>(selector: (state: T) => V): Observable<V> {
        return state.pipe(map(selector));
      }
    };
  }, dependencies);
}
