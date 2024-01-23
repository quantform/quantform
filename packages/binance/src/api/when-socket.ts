import { join } from 'path';

import { useOptions } from '@lib/use-options';
import { whenSocket as whenCoreSocket } from '@quantform/core';

export function whenSocket(patch: string) {
  const { wsUrl } = useOptions();
  const [message] = whenCoreSocket(join(wsUrl, patch));

  return message;
}
