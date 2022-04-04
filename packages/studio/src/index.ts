import { Session } from '@quantform/core';
import { createServer } from 'http';
import next from 'next';
import { concat, from, map, Observable, share, Subject, switchMap } from 'rxjs';
import { parse } from 'url';
import { Worker } from './modules/worker';

import { setSession } from './modules/session/session-accessor';

type Optional<T, K extends keyof T> = Omit<T, K> & Partial<T>;

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
  }
}

function wrapSession(session: Session) {
  const worker = new Worker();

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

      worker.enqueue(() =>
        session.descriptor.measurement.save(session.descriptor.id, [measure])
      );

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

export function studio(port: number, delegate: (session: Session) => Observable<any>) {
  return (session: Session) => {
    wrapSession(session);
    setSession(session);

    return from(server(port)).pipe(switchMap(() => delegate(session)));
  };
}

async function server(port: number) {
  const dev = process.env.NODE_ENV !== 'production';
  const hostname = 'localhost';

  const app = next({ dev, hostname, port });
  const handle = app.getRequestHandler();

  await app.prepare();

  await createServer(async (req, res) => {
    try {
      await handle(req, res, parse(req.url!, true));
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  }).listen(port, undefined, undefined, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
}
