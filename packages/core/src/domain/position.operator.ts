import { map, Observable, share } from 'rxjs';

import { weightedMean } from '../shared';
import { Position } from './position';

export function flatten() {
  return function (
    source: Observable<Position[]>
  ): Observable<{ size: number; rate: number }> {
    return source.pipe(
      map(it => {
        if (it.length > 1) {
          return {
            size: it.reduce((aggregate, position) => aggregate + position.size, 0),
            rate: weightedMean(
              it.map(x => x.averageExecutionRate),
              it.map(x => x.size)
            )
          };
        }

        if (it.length == 1) {
          return {
            size: it[0].size,
            rate: it[0].averageExecutionRate
          };
        }

        return {
          size: 0,
          rate: 0
        };
      }),
      share()
    );
  };
}
