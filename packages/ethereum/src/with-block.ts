import { from } from 'rxjs';

import { useProvider } from './use-provider';

export function withBlock(number: string) {
  const provider = useProvider();

  return from(provider.getBlock(number));
}
