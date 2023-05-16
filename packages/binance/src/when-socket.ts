import { join } from 'path';

import { whenSocket as whenCoreSocket } from '@quantform/core';

import { useOptions } from './use-options';

export function whenSocket(patch: string) {
  const { wsUrl } = useOptions();
  const [message] = whenCoreSocket(join(wsUrl, patch));

  return message;
}
