import { map } from 'rxjs';
import { z } from 'zod';

import { useRequest } from '@lib/use-request';
import { useReplayLock } from '@quantform/core';

const payloadType = z.object({
  time: z.number(),
  marginSummary: z.object({
    accountValue: z.string(),
    totalNtlPos: z.string(),
    totalRawUsd: z.string(),
    totalMarginUsed: z.string()
  }),
  crossMarginSummary: z.object({
    accountValue: z.string(),
    totalNtlPos: z.string(),
    totalRawUsd: z.string(),
    totalMarginUsed: z.string()
  }),
  crossMaintenanceMarginUsed: z.string(),
  withdrawable: z.string(),
  assetPositions: z.array(
    z.object({
      type: z.string(),
      position: z.object({
        coin: z.string(),
        szi: z.string(),
        leverage: z.object({
          type: z.string(),
          value: z.number()
        }),
        entryPx: z.string(),
        positionValue: z.string(),
        unrealizedPnl: z.string(),
        returnOnEquity: z.string(),
        liquidationPx: z.string().nullable(),
        marginUsed: z.string(),
        maxLeverage: z.number(),
        cumFunding: z.object({
          allTime: z.string(),
          sinceOpen: z.string(),
          sinceChange: z.string()
        })
      })
    })
  )
});

export function getUser(address: string) {
  return useReplayLock(
    useRequest({
      patch: '/info',
      body: { type: 'clearinghouseState', user: address }
    }).pipe(map(it => payloadType.parse(it.payload)))
  );
}
