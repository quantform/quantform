import { filter, Observable, tap } from 'rxjs';

export function distinctUntilTimestampChanged<T extends { timestamp: number }>() {
  let prevTimestamp: number | undefined;

  return (stream: Observable<T>) =>
    stream.pipe(
      filter(it => prevTimestamp === undefined || it.timestamp > prevTimestamp),
      tap(it => (prevTimestamp = it.timestamp))
    );
}
