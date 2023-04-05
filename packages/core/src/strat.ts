import { Observable } from 'rxjs';

import { Dependency } from './module';

export function strat(fn: () => Observable<unknown>, dependencies: Dependency[]) {
  return { fn, dependencies };
}
