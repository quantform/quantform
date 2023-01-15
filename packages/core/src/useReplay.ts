import { Observable } from 'rxjs';

import { useExecutionMode } from '@lib/useExecutionMode';
import { useSampler } from '@lib/useSampler';

export function useReplay<T>(input: Observable<T>, dependencies: unknown[]) {
  const { isReal } = useExecutionMode();

  if (isReal) {
    return input;
  }

  const { read, write } = useSampler(dependencies);
}
