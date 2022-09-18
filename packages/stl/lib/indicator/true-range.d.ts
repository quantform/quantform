import { Candle, decimal } from '@quantform/core';
import { Observable } from 'rxjs';
export declare function trueRange<T>(fn: (it: T) => Candle): (source: Observable<T>) => Observable<[T, decimal]>;
//# sourceMappingURL=true-range.d.ts.map