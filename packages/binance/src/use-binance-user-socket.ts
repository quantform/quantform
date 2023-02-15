import {
  combineLatest,
  interval,
  shareReplay,
  skipWhile,
  switchMap,
  takeUntil
} from 'rxjs';

import { shareMemo } from '@quantform/core';

import { useBinanceOptions } from './use-binance-options';
import { useBinanceRequest } from './use-binance-request';
import { useBinanceSocket } from './use-binance-socket';

export function useBinanceUserSocket<T>() {
  const listenKey = useBinanceListenKeyCreateCommand().pipe(shareReplay(1));

  const keepAlive = combineLatest([interval(1000 * 60 * 30), listenKey]).pipe(
    switchMap(([, it]) => useBinanceListenKeyKeepAliveCommand(it.listenKey)),
    skipWhile(() => true)
  );

  return listenKey.pipe(
    switchMap(it => useBinanceSocket<T>(`/ws/${it.listenKey}`)),
    takeUntil(keepAlive),
    shareMemo([useBinanceUserSocket.name])
  );
}

function useBinanceListenKeyCreateCommand() {
  const { apiKey } = useBinanceOptions();

  return useBinanceRequest<{ listenKey: string }>({
    method: 'POST',
    patch: '/api/v3/userDataStream',
    query: {},
    headers: {
      'X-MBX-APIKEY': apiKey!,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
}

function useBinanceListenKeyKeepAliveCommand(listenKey: string) {
  const { apiKey } = useBinanceOptions();

  return useBinanceRequest({
    method: 'PUT',
    patch: '/api/v3/userDataStream',
    query: { listenKey },
    headers: {
      'X-MBX-APIKEY': apiKey!,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
}
