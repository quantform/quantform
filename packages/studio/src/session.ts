import { Session } from '@quantform/core';

export type SessionAccessor = {
  session?: Session;
};

const sessionAccessor: SessionAccessor = {
  session: undefined
};

export function getSessionAccessor() {
  return sessionAccessor;
}
