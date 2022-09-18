import { decimal } from '@quantform/core';
import { Observable } from 'rxjs';
export declare function minMax<T>(length: number, fn: (it: T) => decimal): (source: Observable<T>) => Observable<[T, {
    min: decimal;
    max: decimal;
}]>;
//# sourceMappingURL=min-max.d.ts.map