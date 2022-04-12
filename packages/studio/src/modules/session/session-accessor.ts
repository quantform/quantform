/* eslint-disable no-var */
import { Session } from '@quantform/core';
const globalAny = global as any;

export function getSession(): Session {
  if (!globalAny.session) {
    throw new Error('Session is not defined');
  }
  return globalAny.session;
}

export function setSession(session: Session): void {
  globalAny.session = session;
}
