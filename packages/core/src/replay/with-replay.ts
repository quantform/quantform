import { Observable } from 'rxjs';

import { withMemo } from '@lib/with-memo';
import { dependency } from '@lib/use-hash';

export function withReplay<T extends Array<dependency>, U extends Observable<K>, K>(
  fn: (...args: T) => U
): (...args: T) => U {
  return withMemo(fn);
}
