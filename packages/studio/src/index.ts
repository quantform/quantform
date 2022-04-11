import { Measure, Measurement, Session } from '@quantform/core';
import { createServer } from 'http';
import next from 'next';
import { from, Observable, switchMap } from 'rxjs';
import { parse } from 'url';
import { Worker } from './modules/worker';

import { setSession } from './modules/session/session-accessor';
import { sessionWithMeasurement, IMeasurementHandler } from './modules/session/session';

class WorkerMeasureHandler implements IMeasurementHandler {
  private worker = new Worker();

  constructor(private readonly measurement: Measurement) {}

  handle(session: number, measure: Measure) {
    this.worker.enqueue(() => this.measurement.save(session, [measure]));
  }

  dispose(): Promise<void> {
    return this.worker.wait();
  }
}

export function studio(port: number, delegate: (session: Session) => Observable<any>) {
  return (session: Session) => {
    setSession(session);
    sessionWithMeasurement(
      session,
      new WorkerMeasureHandler(session.descriptor.measurement)
    );

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
