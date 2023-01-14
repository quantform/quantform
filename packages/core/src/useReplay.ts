import { Observable } from 'rxjs';

import { useStorage } from '@lib/storage/useStorage';

export function withReplay<T>(
  input: Observable<T>,
  dependencies: unknown[]
): Observable<T> {
  const storage = useStorage(dependencies);

  return input;
}
