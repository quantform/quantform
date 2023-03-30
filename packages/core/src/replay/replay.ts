import { Observable } from 'rxjs';

import { use } from '@lib/use';
import { dependency } from '@lib/use-hash';

export function replay<T extends Array<dependency>, U extends Observable<K>, K>(
  fn: (...args: T) => U
): (...args: T) => U {
  console.log('registering pulling');
  return use(fn);
}
