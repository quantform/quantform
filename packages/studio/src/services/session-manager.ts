import { Session } from '@quantform/core';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalAny = global as any;

export function getServerSession(): Session {
  if (!globalAny.session) {
    throw new Error('Session is not set!');
  }

  return globalAny.session;
}

export function setSession(session: Session) {
  globalAny.session = session;
}
