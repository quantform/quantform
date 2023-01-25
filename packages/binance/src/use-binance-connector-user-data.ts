import { shareReplay, Subject, switchMap } from 'rxjs';

import { useBinanceConnector } from '@lib/use-binance-connector';
import { useState, useTimestamp } from '@quantform/core';

export function useBinanceConnectorUserData() {
  const [userData] = useState(
    useBinanceConnector().pipe(
      switchMap(it => {
        const message$ = new Subject<{ timestamp: number; payload: any }>();

        it.userData2(payload => message$.next({ timestamp: useTimestamp(), payload }));

        return message$.pipe(shareReplay(1));
      })
    ),
    [useBinanceConnectorUserData.name]
  );

  return userData;
}
