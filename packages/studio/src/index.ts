import { Session } from '@quantform/core';
import { createServer } from 'http';
import next from 'next';
import { defer, from, Observable, switchMap } from 'rxjs';
import { parse } from 'url';

import { setSession } from './modules/session/session-accessor';
import { sessionWithMeasurement } from './modules/session/session';
import { dirname } from 'path';

export * from './modules/charting/charting-layout';

export function study(port: number, delegate: (session: Session) => Observable<any>) {
  return (session: Session) => {
    sessionWithMeasurement(session);

    return from(server(port, session)).pipe(
      switchMap(() => defer(() => delegate(session)))
    );
  };
}

async function server(port: number, session: Session) {
  const dev = false; //process.env.NODE_ENV !== 'production';
  const hostname = 'localhost';
  const dir = dirname(require.resolve('@quantform/studio/package.json'));

  const app = next({
    dev,
    hostname,
    port,
    dir
  });
  const handle = app.getRequestHandler();

  await app.prepare();

  await createServer(async (req, res) => {
    try {
      setSession(session);

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
