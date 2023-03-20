import { Observable, shareReplay } from 'rxjs';

import { asReadonly } from './as-readonly';
import { dependency } from './use-hash';
import { withMemo } from './with-memo';

export const use = <T extends Array<dependency>, U>(fn: (...args: T) => Observable<U>) =>
  withMemo((...args: T) => fn(...args).pipe(asReadonly(), shareReplay(1)));
