/* eslint-disable no-var */
import { Session } from '@quantform/core';

export type SessionAccessor = {
  session?: Session;
};

let sessionAccessor: SessionAccessor;

const globalAny = global as any;

if (process.env.NODE_ENV === 'production') {
  sessionAccessor = {
    session: undefined
  };
} else {
  if (!globalAny.sessionAccessor) {
    globalAny.sessionAccessor = {
      session: undefined
    };
  }
  sessionAccessor = globalAny.sessionAccessor;
}

export function getSession(): Session {
  if (!sessionAccessor.session) {
    throw new Error('Session is not defined');
  }
  return sessionAccessor.session;
}

export function setSession(session: Session): void {
  sessionAccessor.session = session;
}
