import { decimal } from '@quantform/core';
import { Observable } from 'rxjs';
export declare function swma<T>(fn: (it: T) => decimal): (source: Observable<T>) => Observable<[T, decimal]>;
//# sourceMappingURL=swma.d.ts.map