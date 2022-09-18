import { decimal } from '@quantform/core';
import { Observable } from 'rxjs';
export declare function ema<T>(length: number, fn: (it: T) => decimal): (source: Observable<T>) => Observable<[T, decimal]>;
//# sourceMappingURL=ema.d.ts.map