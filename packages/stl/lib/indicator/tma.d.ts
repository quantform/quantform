import { decimal } from '@quantform/core';
import { Observable } from 'rxjs';
export declare function tma<T>(length: number, fn: (it: T) => decimal): (source: Observable<T>) => Observable<[T, decimal]>;
//# sourceMappingURL=tma.d.ts.map