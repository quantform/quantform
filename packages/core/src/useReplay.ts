import { Observable } from 'rxjs';

export function withReplay<T>(
  input: Observable<T>,
  dependencies: unknown[]
): Observable<T> {
  return input;
}
