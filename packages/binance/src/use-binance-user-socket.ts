import { defer, map, switchMap, tap } from 'rxjs';

import { memo } from '@quantform/core';

import { useBinanceSignedRequest } from './use-binance-signed-request';
import { useBinanceSocket } from './use-binance-socket';

export function useBinanceUserSocket<T>() {
  const listenKey = useBinanceSignedRequest<{ listenKey: string }>({
    method: 'POST',
    patch: '/api/v3/userDataStream',
    query: {}
  }).pipe(map(it => console.log(it)));

  return defer(() =>
    listenKey.pipe(
      switchMap(it => useBinanceSocket<T>(`/ws/${it}`)),
      tap(it => console.log(it)),
      memo([useBinanceUserSocket.name])
    )
  );
}
