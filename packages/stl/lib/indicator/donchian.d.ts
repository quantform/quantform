import { Candle, decimal } from '@quantform/core';
import { Observable } from 'rxjs';
export declare function donchian<T>(length: number, fn: (it: T) => Candle): (source: Observable<T>) => Observable<[
    T,
    {
        upper: decimal;
        lower: decimal;
    }
]>;
//# sourceMappingURL=donchian.d.ts.map