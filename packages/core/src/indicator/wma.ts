import { filter, map, Observable, share } from 'rxjs';
import { window } from './window';

export function wma<T>(length: number, fn: (it: T) => number) {
  return function (source: Observable<T>): Observable<[T, number]> {
    return source.pipe(
      window(length, fn),
      filter(([, buffer]) => buffer.isFull),
      map(([it, buffer]) => {
        let norm = 0.0;
        let sum = 0.0;

        for (let i = 0; i < buffer.capacity; i++) {
          const weight = (buffer.capacity - i) * buffer.capacity;

          norm = norm + weight;
          sum = sum + buffer.at(buffer.capacity - (i + 1)) * weight;
        }

        const tuple: [T, number] = [it, sum / norm];

        return tuple;
      }),
      share()
    );
  };
}
