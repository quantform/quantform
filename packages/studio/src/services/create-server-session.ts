import { Session } from '@quantform/core';
import { createServer } from 'http';
import next from 'next';
import { dirname } from 'path';
import { parse } from 'url';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalAny = global as any;

export async function createServerSession(port: number, session: Session) {
  const dev = false; //process.env.NODE_ENV !== 'production';
  const hostname = 'localhost';
  const dir = ''; //dirname(require.resolve('@quantform/studio/package.json'));

  globalAny.session = session;

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
  }).listen(port, undefined, undefined, () => {
    console.log(
      '\x1b[36m%s\x1b[0m',
      'info',
      ` - Studio is ready on http://${hostname}:${port}`
    );
  });
}

export function getServerSession(): Session {
  if (!globalAny.session) {
    throw new Error('Session is not defined');
  }

  return globalAny.session;
}
