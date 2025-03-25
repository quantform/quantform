import { deserialize } from 'borsh';
import { filter, map } from 'rxjs';

import { useMemo } from '@quantform/core';
import { Commitment } from '@quantform/solana';

import { watchProgramData } from './watch-program-data';

const layout = {
  struct: {
    discriminator: 'u64',
    feeRecipient: { array: { type: 'u8', len: 32 } },
    initialVirtualTokenReserves: 'u64',
    initialVirtualSolReserves: 'u64',
    initialRealTokenReserves: 'u64',
    tokenTotalSupply: 'u64',
    feeBasisPoints: 'u64'
  }
};

const discriminator = Buffer.from([223, 195, 159, 246, 62, 48, 143, 131]);

export function watchProgramSetParams(commitment: Commitment) {
  return useMemo(
    () =>
      watchProgramData(commitment).pipe(
        filter(({ payload }) =>
          payload.program.subarray(0, discriminator.length).equals(discriminator)
        ),
        map(({ timestamp, payload }) => ({
          timestamp,
          payload: {
            context: payload.context,
            event: deserialize(layout, payload.program)
          }
        })),
        filter(({ payload }) => payload.event != null)
      ),
    ['pump-fun', watchProgramSetParams.name, commitment]
  );
}
