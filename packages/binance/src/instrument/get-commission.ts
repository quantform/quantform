import { map } from 'rxjs';

import { withUserAccountRequest } from '@lib/api/with-user-account-request';
import { Commission, d, useCache } from '@quantform/core';

export function getCommission() {
  return useCache(
    withUserAccountRequest().pipe(
      map(
        it =>
          new Commission(
            d(it.payload.makerCommission).div(100),
            d(it.payload.takerCommission).div(100)
          )
      )
    ),
    ['binance/commission']
  );
}
