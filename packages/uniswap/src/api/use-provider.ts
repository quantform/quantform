import { ethers } from 'ethers';

import { useOptions } from '@lib/use-options';
import { withMemo } from '@quantform/core';

export const useProvider = withMemo(() => {
  const { rpc } = useOptions();

  if (!rpc.wss) {
    throw new Error('missing rpc web socket address');
  }

  return new ethers.WebSocketProvider(rpc.wss);
});
