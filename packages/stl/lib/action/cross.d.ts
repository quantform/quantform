import { decimal } from '@quantform/core';
import { Observable } from 'rxjs';
export declare function crossUnder<T>(trigger: decimal | ((it: T) => decimal), value: (it: T) => decimal): (source: Observable<T>) => Observable<T>;
export declare function crossOver<T>(trigger: decimal | ((it: T) => decimal), value: (it: T) => decimal): (source: Observable<T>) => Observable<T>;
//# sourceMappingURL=cross.d.ts.map