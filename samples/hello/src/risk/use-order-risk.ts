import {
  combineLatest,
  filter,
  finalize,
  forkJoin,
  interval,
  switchMap,
  take,
  takeWhile,
  tap
} from 'rxjs';

import { Binance, orderNotFound } from '@quantform/binance';
import { decimal, exclude, Instrument, now } from '@quantform/core';

import { useOrderExecution } from './use-order-execution';

export const useOrderRisk = (id: string, instrument: Instrument, rate: decimal) =>
  forkJoin([
    useOrderExecution(id, instrument, rate),
    closeOrderAfterOneMinute(id, instrument)
  ]);

const closeOrderAfterOneMinute = (id: string, instrument: Instrument) =>
  combineLatest([
    Binance.useOrder(id, instrument).pipe(
      exclude(orderNotFound),
      tap(it => console.log(it))
    ),
    interval(1000)
  ]).pipe(
    takeWhile(([it]) => it.cancelable),
    tap(() => console.log('checking..')),
    filter(([it]) => it.createdAt + 1000 * 60 < now()),
    switchMap(([it]) => Binance.useOrderCancel(it)),
    take(1),
    finalize(() => console.log('DONE'))
  );
