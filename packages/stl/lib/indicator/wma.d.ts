import { decimal } from '@quantform/core';
import { Observable } from 'rxjs';
export declare function wma<T>(length: number, fn: (it: T) => decimal): (source: Observable<T>) => Observable<[T, decimal]>;
//# sourceMappingURL=wma.d.ts.map