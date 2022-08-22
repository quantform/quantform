import { Logger, Session } from '@quantform/core';
import { createServer } from 'http';
import next from 'next';
import { defer, from, Observable, switchMap } from 'rxjs';
import { parse } from 'url';

import { setSession } from './modules/session/session-accessor';
import { sessionWithMeasurement, StudySession } from './modules/session/session';
import { dirname } from 'path';

export * from './modules/charting/charting-layout';

export type { StudySession } from './modules/session/session';

export function study(
  port: number,
  delegate: (session: StudySession) => Observable<any>
) {
  return (session: Session) => {
    const studioSession = sessionWithMeasurement(session);
    setSession(studioSession);

    return from(server(port, studioSession)).pipe(
      switchMap(() => defer(() => delegate(studioSession)))
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
      await handle(req, res, parse(req.url!, true));
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  }).listen(port, undefined, undefined, () =>
    Logger.info('studio', `started on http://${hostname}:${port}`)
  );
}
