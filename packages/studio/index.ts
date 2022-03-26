import { Session } from '@quantform/core';
import { from, Observable, switchMap } from 'rxjs';

import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';

export function studio(port: number, delegate: (session: Session) => Observable<any>) {
  return (session: Session) =>
    from(server(port)).pipe(switchMap(it => delegate(session)));
}

async function server(port: number) {
  const dev = process.env.NODE_ENV !== 'production';
  const hostname = 'localhost';

  const app = next({ dev, hostname, port });
  const handle = app.getRequestHandler();

  await app.prepare();

  await createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      const { pathname, query } = parsedUrl;

      if (pathname === '/a') {
        await app.render(req, res, '/a', query);
      } else if (pathname === '/b') {
        await app.render(req, res, '/b', query);
      } else {
        await handle(req, res, parsedUrl);
      }
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  }).listen(port, undefined, undefined, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
}
