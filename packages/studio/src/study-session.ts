import { Logger, Measurement, Session } from '@quantform/core';
import { createServer } from 'http';
import next from 'next';
import { join } from 'path';
import { concat, filter, from, map, Observable, ReplaySubject, share } from 'rxjs';
import { parse } from 'url';

import { LayoutModel } from './models';

type Optional<T, K extends keyof T> = Omit<T, K> & Partial<T>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalAny = global as any;

export function getStudySession(): StudySession {
  if (!globalAny.session) {
    throw new Error('Session is not set!');
  }

  return globalAny.session;
}

export type StudySession = Session & {
  layout: LayoutModel;
  measurement: Measurement;

  useMeasure<T extends { timestamp: number }>(
    params: { kind: string; timestamp?: number },
    defaultValue?: T
  ): [Observable<T>, (value: Optional<T, 'timestamp'>) => void];
};

export function wrapToStudySession(
  options: StudySessionOptions,
  session: Session
): StudySession {
  const { descriptor } = session;

  if (!descriptor || !descriptor.id || !descriptor.storage) {
    throw new Error();
  }

  const studySession = session as StudySession;
  const measurement = new Measurement(descriptor.storage('measurement'));

  studySession.measurement = measurement;
  studySession.layout = options.layout;

  studySession.useMeasure = <T extends { timestamp: number }>(
    spec: {
      kind: string;
      timestamp?: number;
    },
    defaultValue?: Optional<T, 'timestamp'>
  ) => {
    const { id } = descriptor;

    if (!id) {
      throw new Error();
    }

    const changes$ = new ReplaySubject<Optional<T, 'timestamp'>>();
    const persisted$ = from(
      measurement.query(id, {
        to: spec.timestamp ?? session.timestamp,
        kind: spec.kind,
        count: 1
      })
    ).pipe(
      map(it =>
        it.length ? { timestamp: it[0].timestamp, ...it[0].payload } : defaultValue
      ),
      share()
    );

    const setter = (value: Optional<T, 'timestamp'>) => {
      const timestamp = value.timestamp ?? session.timestamp;
      const measure = { timestamp, kind: spec.kind, payload: value };

      measurement.save(id, [measure]);

      changes$.next({ ...value, timestamp });
    };

    return [
      concat(persisted$, changes$.asObservable()).pipe(filter(it => it !== undefined)),
      setter
    ];
  };

  return studySession;
}

export type StudySessionOptions = { port: number; layout: LayoutModel };

export async function createStudySession(
  options: StudySessionOptions,
  session: Session
): Promise<StudySession> {
  const dev = false; //process.env.NODE_ENV !== 'production';
  const hostname = 'localhost';
  const dir = join(__dirname, '../');

  const studySession = wrapToStudySession(options, session);

  globalAny.session = studySession;

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

  return studySession;
}
