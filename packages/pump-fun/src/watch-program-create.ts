import { deserialize } from 'borsh';
import { filter, map } from 'rxjs';

import { useMemo } from '@quantform/core';
import { Commitment } from '@quantform/solana';

import { watchProgramData } from './watch-program-data';

const layout = {
  struct: {
    discriminator: 'u64',
    name: 'string',
    symbol: 'string',
    uri: 'string',
    mint: { array: { type: 'u8', len: 32 } },
    bondingCurve: { array: { type: 'u8', len: 32 } },
    user: { array: { type: 'u8', len: 32 } }
  }
};

const discriminator = Buffer.from([27, 114, 169, 77, 222, 235, 99, 118]);

export function watchProgramCreate(commitment: Commitment) {
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
    ['pump-fun', watchProgramCreate.name, commitment]
  );
}
