import { Logger, Session } from '@quantform/core';
import { createServer } from 'http';
import next from 'next';
import { join } from 'path';
import { defer, from, Observable, switchMap } from 'rxjs';
import { parse } from 'url';

import { setSession } from './services/session-manager';

async function createServerSession(port: number, session: Session) {
  const dev = false; //process.env.NODE_ENV !== 'production';
  const hostname = 'localhost';
  const dir = join(__dirname, '../');

  setSession(session);

  const app = next({
    dev,
    hostname,
    port,
    dir
  });

  const handle = app.getRequestHandler();

  await app.prepare();

  await createServer(async (req, res) => {
    if (!req.url) {
      throw new Error('missing url');
    }

    try {
      await handle(req, res, parse(req.url, true));
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  }).listen(port, undefined, undefined, () =>
    Logger.info('studio', `Studio is ready on http://${hostname}:${port}`)
  );
}

export function study(port: number, delegate: (session: Session) => Observable<any>) {
  return (session: Session) =>
    from(createServerSession(port, session)).pipe(
      switchMap(() => defer(() => delegate(session)))
    );
}
