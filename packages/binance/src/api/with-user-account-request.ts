import { map } from 'rxjs';
import { z } from 'zod';

import { withSignedRequest } from '@lib/api/with-signed-request';
import { useExecutionMode } from '@quantform/core';

import { withSimulator } from './simulator';

const responseType = z.object({
  makerCommission: z.number(),
  takerCommission: z.number(),
  balances: z.array(
    z.object({
      asset: z.string(),
      free: z.string(),
      locked: z.string()
    })
  )
});

const request = () =>
  withSignedRequest({
    method: 'GET',
    patch: '/api/v3/account',
    query: {}
  }).pipe(
    map(({ timestamp, payload }) => ({
      timestamp,
      payload: responseType.parse(payload)
    }))
  );

export function withUserAccountRequest(): ReturnType<typeof request> {
  const { isSimulation } = useExecutionMode();

  if (!isSimulation) {
    return request();
  }

  return withSimulator().pipe(
    map(({ snapshot }) => {
      const { timestamp, commission, balances } = snapshot();

      return {
        timestamp,
        payload: {
          makerCommission: commission.makerRate.mul(100).toNumber(),
          takerCommission: commission.takerRate.mul(100).toNumber(),
          balances: Object.values(balances).map(it => ({
            asset: it.asset.name,
            free: it.free.toString(),
            locked: it.locked.toString()
          }))
        }
      };
    })
  );
}
