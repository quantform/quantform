import { Session } from '@quantform/core';
import { defer, from, Observable, switchMap } from 'rxjs';

import { createServerSession } from './services';

export * from './services';

export function study(port: number, delegate: (session: Session) => Observable<void>) {
  return (session: Session) =>
    from(createServerSession(port, session)).pipe(
      switchMap(() => defer(() => delegate(session)))
    );
}
