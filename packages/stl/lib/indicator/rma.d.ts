import { decimal } from '@quantform/core';
import { Observable } from 'rxjs';
export declare function rma<T>(length: number, fn: (it: T) => decimal): (source: Observable<T>) => Observable<[T, decimal]>;
//# sourceMappingURL=rma.d.ts.map