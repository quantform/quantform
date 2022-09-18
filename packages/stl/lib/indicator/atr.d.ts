import { Candle, decimal } from '@quantform/core';
import { Observable } from 'rxjs';
export declare function atr<T>(length: number, fn: (it: T) => Candle): (source: Observable<T>) => Observable<[T, decimal]>;
//# sourceMappingURL=atr.d.ts.map