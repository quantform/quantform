import { Measure, Session } from '@quantform/core';
import { concat, from, map, Observable, share, Subject } from 'rxjs';

type Optional<T, K extends keyof T> = Omit<T, K> & Partial<T>;

export interface IMeasurementHandler {
  handle(session: number, measure: Measure);
  dispose(): Promise<void>;
}

declare module '@quantform/core' {
  interface Session {
    /**
     * Returns last stored measurement and setter for it in session.
     * For example you can save and restore variables in same session between runs.
     * Example usage:
     * const [order$, setOrder] = session.measurement<Order>('order');
     *
     * order.pipe(tap(it => console.log(`your last order was: ${it}`)));
     *
     * setOrder(order);
     */
    useMeasure<T extends { timestamp: number }>(
      params: { kind: string; timestamp?: number },
      defaultValue?: T
    ): [Observable<T>, (value: Optional<T, 'timestamp'>) => void];

    measurement$: Observable<Measure>;
  }
}

export function sessionWithMeasurement(session: Session, handler: IMeasurementHandler) {
  const subj$ = new Subject<Measure>();

  session.measurement$ = subj$.asObservable();

  session.useMeasure = <T extends { timestamp: number }>(
    params: { kind: string; timestamp?: number },
    defaultValue?: T
  ): [Observable<T>, (value: Optional<T, 'timestamp'>) => void] => {
    const stored$ = from(
      session.descriptor.measurement.query(session.descriptor.id, {
        to: params.timestamp ?? session.timestamp,
        kind: params.kind,
        count: 1
      })
    ).pipe(
      map(it =>
        it.length ? { timestamp: it[0].timestamp, ...it[0].payload } : defaultValue
      ),
      share()
    );

    const subject$ = new Subject<T>();

    const setter = (value: T) => {
      const timestamp = value.timestamp ?? session.timestamp;
      const measure = { timestamp, kind: params.kind, payload: value };

      subj$.next(measure);

      handler.handle(session.descriptor.id, measure);

      subject$.next({ ...value, timestamp });
    };

    return [concat(stored$, subject$.asObservable()), setter];
  };

  const pureFunction = session.dispose;

  session.dispose = async () => {
    await pureFunction.apply(session);
    await handler.dispose();
  };
}
