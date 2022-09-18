import { decimal } from '@quantform/core';
import { Observable } from 'rxjs';
export declare function envelope<T>(length: number, percent: number, valueFn: (it: T) => decimal): (source: Observable<T>) => Observable<{
    min: decimal;
    max: decimal;
}>;
//# sourceMappingURL=envelope.d.ts.map