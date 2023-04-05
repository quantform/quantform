import { join } from 'path';

import { useSocket } from '@quantform/core';

import { useOptions } from './use-options';

export function useReadonlySocket(patch: string) {
  const { wsUrl } = useOptions();
  const [message] = useSocket(join(wsUrl, patch));

  return message;
}
