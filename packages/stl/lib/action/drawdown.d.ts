import { decimal } from '@quantform/core';
import { Observable } from 'rxjs';
export declare function drawdown<T>(fn: (it: T) => decimal): (source: Observable<T>) => Observable<decimal>;
//# sourceMappingURL=drawdown.d.ts.map