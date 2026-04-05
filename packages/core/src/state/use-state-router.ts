import { filter, Observable, Subject } from 'rxjs';
import { StateFactory, EventHandler } from './use-state';

type EventOf<C> = C extends StateFactory<infer E> ? E : never;

export function useStateRouter<C extends readonly StateFactory<any>[]>(...states: C) {
  type E = EventOf<C[number]>;

  const handlerByType = new Map<E['type'], (event: E) => void>();
  const pending: E[] = [];

  const dispatch = (event: E) => {
    pending.push(event);

    handlerByType.get(event.type)?.(event);
  };

  const addState = <S extends E>(factory: StateFactory<S>) => {
    const on = <T extends S['type']>(
      type: T,
      fn: (event: Extract<S, { type: T }>) => void
    ): EventHandler<E> => {
      const handler = fn as unknown as EventHandler<E>;
      handler.eventType = type;
      return handler;
    };

    const handlers = factory({
      apply: e => dispatch(e as E),
      on
    });

    for (const fn of handlers) {
      const eventType = fn.eventType;
      const existing = handlerByType.get(eventType);
      const wrapped = ((e: E) => fn(e as S)) as (event: E) => void;

      handlerByType.set(
        eventType,
        existing
          ? (e: E) => {
              existing(e);
              wrapped(e);
            }
          : wrapped
      );
    }
  };

  states.forEach(it => addState(it));

  const event$ = new Subject<E>();

  return {
    watch: <T extends E['type']>(type: T): Observable<Extract<E, { type: T }>> => {
      return event$.pipe(filter((it): it is Extract<E, { type: T }> => it.type === type));
    },

    apply: (event: E) => {
      dispatch(event);
      pending.splice(0).forEach(it => event$.next(it));
    }
  };
}
