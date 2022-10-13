import { Session } from '@quantform/core';

import { LayoutModel } from '../models';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalAny = global as any;

export type SessionContext = {
  session: Session | undefined;
  layout: LayoutModel | undefined;
  title: string;
};

export function getSessionContext(): Readonly<SessionContext> {
  if (!globalAny.context) {
    throw new Error('Session context is not set!');
  }

  return globalAny.context;
}

export function patchSessionContext(patch: Partial<SessionContext>) {
  globalAny.context = {
    ...globalAny.context,
    ...patch
  };
}
