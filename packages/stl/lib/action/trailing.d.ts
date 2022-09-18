import { decimal } from '@quantform/core';
import { Observable } from 'rxjs';
export declare class Trailing {
    readonly trigger: decimal;
    readonly buffer: decimal;
    private triggered;
    private max?;
    private min?;
    constructor(trigger: decimal, buffer: decimal);
    up(value: decimal): boolean;
    down(value: decimal): boolean;
}
export declare function trailingUp<T>(trigger: decimal, buffer: decimal, value: (it: T) => decimal): (source: Observable<T>) => Observable<T>;
export declare function trailingDown<T>(trigger: decimal, buffer: decimal, value: (it: T) => decimal): (source: Observable<T>) => Observable<T>;
//# sourceMappingURL=trailing.d.ts.map