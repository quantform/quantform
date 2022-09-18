import { Observable } from 'rxjs';
import { RingBuffer } from './ring-buffer';
export declare function window<T, Y>(length: number, fn: (value: T) => Y): (source: Observable<T>) => Observable<[T, RingBuffer<Y>, Y, Y?]>;
//# sourceMappingURL=window.d.ts.map