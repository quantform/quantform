import { useMemo, useReplay } from '@quantform/core';

import { Commitment } from './commitment';
import { useSocketSubscription } from './use-socket-subscription';

export function watchProgram(
  programId: string,
  commitment: Commitment,
  encoding: 'base58' | 'base64' | 'base64+zstd' | 'jsonParsed'
) {
  const key = ['solana', 'watch-program', programId, commitment, encoding];

  return useMemo(
    () =>
      useReplay(
        useSocketSubscription<{
          pubkey: string;
          account: {
            data: unknown;
          };
        }>(commitment, {
          method: 'programSubscribe',
          params: [programId, { commitment, encoding }]
        }),
        key
      ),
    key
  );
}
