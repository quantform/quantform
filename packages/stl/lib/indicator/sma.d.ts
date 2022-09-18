import { decimal } from '@quantform/core';
import { Observable } from 'rxjs';
export declare function sma<T>(length: number, fn: (it: T) => decimal): (source: Observable<T>) => Observable<[T, decimal]>;
//# sourceMappingURL=sma.d.ts.map