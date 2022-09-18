import { Observable } from 'rxjs';
declare type Constructor<T> = new (...args: any[]) => T;
export declare function ofType<T extends K, K>(type: Constructor<T>): (input: Observable<K>) => Observable<T>;
export {};
//# sourceMappingURL=pipe.d.ts.map