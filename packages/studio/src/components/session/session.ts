import { Measure, Measurement, Session } from '@quantform/core';
import { concat, filter, from, map, Observable, share, Subject } from 'rxjs';
/*
import { Worker } from '../../modules/worker';

type Optional<T, K extends keyof T> = Omit<T, K> & Partial<T>;

export type StudySession = Session & {
  useMeasure<T extends { timestamp: number }>(
    params: { kind: string; timestamp?: number },
    defaultValue?: T
  ): [Observable<T>, (value: Optional<T, 'timestamp'>) => void];

  measurement$: Observable<Measure>;
};

export function sessionWithMeasurement(session: Session): StudySession {
  const subj$ = new Subject<Measure>();
  const worker = new Worker();

  const studioSession = session as StudySession;

  studioSession.measurement$ = subj$.asObservable();

  studioSession.useMeasure = <T extends { timestamp: number }>(
    params: { kind: string; timestamp?: number },
    defaultValue?: T
  ): [Observable<T>, (value: Optional<T, 'timestamp'>) => void] => {
    const { storage } = session.descriptor!;
    const measurement = new Measurement(storage!('measurement'));

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

    return [
      concat(stored$, subject$.asObservable()).pipe(filter(it => it !== undefined)),
      setter
    ];
  };

  const pureFunction = session.dispose;

  session.dispose = async () => {
    await pureFunction.apply(session);
    await worker.wait();
  };

  return studioSession;
}
*/
