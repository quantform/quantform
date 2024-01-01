import { Observable } from 'rxjs';

import { dependency } from '@lib/use-hash';
import { withMemo } from '@lib/with-memo';

export function withReplay<T extends Array<dependency>, U extends Observable<K>, K>(
  fn: (...args: T) => U
): (...args: T) => U {
  return withMemo(fn);
}
