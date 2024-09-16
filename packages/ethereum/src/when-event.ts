import { Observable } from 'rxjs';
import { ZodType } from 'zod';

import { useProvider } from './use-provider';

export function whenEvent<T>(name: string, type: ZodType<T>) {
  const provider = useProvider();

  return new Observable<T>(subscriber => {
    provider.on(name, e => {
      subscriber.next(type.parse(e));
    });
  });
}
