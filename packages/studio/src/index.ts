import { Session } from '@quantform/core';
import { createServer } from 'http';
import next from 'next';
import { from, Observable, switchMap } from 'rxjs';
import { parse } from 'url';

import { getSessionAccessor } from './session';

export function studio(port: number, delegate: (session: Session) => Observable<any>) {
  return (session: Session) => {
    getSessionAccessor().session = session;

    return from(server(port)).pipe(switchMap(it => delegate(session)));
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
