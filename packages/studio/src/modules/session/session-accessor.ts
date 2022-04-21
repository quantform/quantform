/* eslint-disable no-var */
import { StudySession } from './session';
const globalAny = global as any;

export function getSession(): StudySession {
  if (!globalAny.session) {
    throw new Error('Session is not defined');
  }
  return globalAny.session;
}

export function setSession(session: StudySession): void {
  globalAny.session = session;
}
