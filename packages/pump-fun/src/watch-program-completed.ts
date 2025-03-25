import { deserialize } from 'borsh';
import { filter, map } from 'rxjs';

import { useMemo } from '@quantform/core';
import { Commitment } from '@quantform/solana';

import { watchProgramData } from './watch-program-data';

const layout = {
  struct: {
    discriminator: 'u64',
    user: { array: { type: 'u8', len: 32 } },
    mint: { array: { type: 'u8', len: 32 } },
    bondingCurve: { array: { type: 'u8', len: 32 } },
    timestamp: 'i64'
  }
};

const discriminator = Buffer.from([95, 114, 97, 156, 212, 46, 152, 8]);

export function watchProgramCompleted(commitment: Commitment) {
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
    ['pump-fun', watchProgramCompleted.name, commitment]
  );
}
