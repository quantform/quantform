import { Logger, Session } from '@quantform/core';
import { createServer } from 'http';
import next from 'next';
import { join } from 'path';
import { defer, from, Observable, switchMap } from 'rxjs';
import { parse } from 'url';

import { LayoutModel } from './models';

export {
  layout,
  pane,
  area,
  bar,
  candlestick,
  histogram,
  linear,
  marker
} from './models';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalAny = global as any;

export function getStudySession(): Session {
  if (!globalAny.session) {
    throw new Error('Session is not set!');
  }

  return globalAny.session;
}

export function getStudyOptions(): StudySessionOptions {
  if (!globalAny.options) {
    throw new Error('Session options not set!');
  }

  return globalAny.options;
}

export type StudySessionOptions = { port: number; layout: LayoutModel };

export async function createStudySession(options: StudySessionOptions, session: Session) {
  const dev = false; //process.env.NODE_ENV !== 'production';
  const hostname = 'localhost';
  const dir = join(__dirname, '../');

  globalAny.session = session;
  globalAny.options = options;

  const app = next({
    dev,
    hostname,
    port: options.port,
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
  }).listen(options.port, undefined, undefined, () =>
    Logger.info('studio', `Studio is ready on http://${hostname}:${options.port}`)
  );
}

export function study(
  options: StudySessionOptions,
  delegate: (session: Session) => Observable<any>
) {
  return (session: Session) =>
    from(createStudySession(options, session)).pipe(
      switchMap(() => defer(() => delegate(session)))
    );
}
