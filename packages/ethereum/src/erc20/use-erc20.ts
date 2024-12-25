import { withBalance } from '@lib/with-balance';

import { withAsset } from './with-asset';

export function useERC20(contractAddress: string) {
  return {
    withBalance,
    withAsset(address: string) {
      withAsset(address);
    }
  };
}
