import { ethers, Provider } from 'ethers';

import { withMemo } from '@quantform/core';

import { useOptions } from './use-options';

export const useProvider = withMemo(() => {
  const { rpc } = useOptions();

  if (!rpc.wss) {
    throw new Error('missing rpc web socket address');
  }

  return new ethers.WebSocketProvider(rpc.wss) as Provider;
});
