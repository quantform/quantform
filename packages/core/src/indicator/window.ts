import { map, Observable, share } from 'rxjs';
import { RingBuffer } from './ring-buffer';

export function window<T, Y>(length: number, fn: (value: T) => Y) {
  return function (source: Observable<T>): Observable<[T, RingBuffer<Y>, Y, Y]> {
    const buffer = new RingBuffer<Y>(length);

    return source.pipe(
      map(it => {
        let removed = null;

        if (buffer.isFull) {
          removed = buffer.peek();
        }

        const value = fn(it);

        buffer.enqueue(value);

        const tuple: [T, RingBuffer<Y>, Y, Y] = [it, buffer, value, removed];

        return tuple;
      }),
      share()
    );
  };
}
