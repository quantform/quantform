import { decimal } from '@quantform/core';
import { Observable } from 'rxjs';
export declare function macd<T>(fast: number, slow: number, length: number, fn: (it: T) => decimal): (source: Observable<T>) => Observable<decimal>;
//# sourceMappingURL=macd.d.ts.map