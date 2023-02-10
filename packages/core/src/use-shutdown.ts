import { Observable, takeUntil } from 'rxjs';

import { useState } from './use-state';

export function useShutdown() {
  const [shutdown, setShutdown] = useState(false, [useShutdown.name]);

  return {
    closed: shutdown,
    shutdown: () => setShutdown(true)
  };
}

export function untilShutdown<T>() {
  const { closed } = useShutdown();

  return (stream: Observable<T>) => stream.pipe(takeUntil(closed));
}
