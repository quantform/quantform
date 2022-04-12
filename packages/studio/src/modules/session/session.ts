import { Measure, Session } from '@quantform/core';
import { concat, from, map, Observable, share, Subject } from 'rxjs';
import { Worker } from '../../modules/worker';

type Optional<T, K extends keyof T> = Omit<T, K> & Partial<T>;

declare module '@quantform/core' {
  interface Session {
    /**
     * Returns last stored measurement and setter for it in session.
     * For example you can save and restore variables in same session between runs.
     * Example usage:
     * const [order$, setOrder] = session.measurement<Order>('order');
     *
     * order$.pipe(tap(it => console.log(`your last order was: ${it}`)));
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

export function sessionWithMeasurement(session: Session) {
  const subj$ = new Subject<Measure>();
  const worker = new Worker();

  session.measurement$ = subj$.asObservable();

  session.useMeasure = <T extends { timestamp: number }>(
    params: { kind: string; timestamp?: number },
    defaultValue?: T
  ): [Observable<T>, (value: Optional<T, 'timestamp'>) => void] => {
    const { measurement } = session.descriptor!;

    const stored$ = from(
      measurement!.query(session.descriptor!.id!, {
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

    const subject$ = new Subject<Optional<T, 'timestamp'>>();

    const setter = (value: Optional<T, 'timestamp'>) => {
      const timestamp = value.timestamp ?? session.timestamp;
      const measure = { timestamp, kind: params.kind, payload: value };

      subj$.next(measure);

      worker.enqueue(() => measurement!.save(session.descriptor?.id!, [measure]));
      subject$.next({ ...value, timestamp });
    };

    return [concat(stored$, subject$.asObservable()), setter];
  };

  const pureFunction = session.dispose;

  session.dispose = async () => {
    await pureFunction.apply(session);
    await worker.wait();
  };
}
