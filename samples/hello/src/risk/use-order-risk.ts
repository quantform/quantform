import {
  combineLatest,
  delay,
  filter,
  finalize,
  forkJoin,
  from,
  interval,
  map,
  of,
  switchMap,
  take,
  takeWhile,
  tap
} from 'rxjs';

import { Binance, orderNotFound } from '@quantform/binance';
import {
  decimal,
  exclude,
  exclusive,
  Instrument,
  now,
  useExclusiveLock,
  useLogger
} from '@quantform/core';

import { useOrderExecution } from './use-order-execution';

export const useOrderRisk = (id: string, instrument: Instrument, rate: decimal) =>
  forkJoin([
    useOrderExecution(id, instrument, rate),
    closeOrderAfterOneMinute(id, instrument)
  ]);

const closeOrderAfterOneMinute = (id: string, instrument: Instrument) => {
  const { acquire, alreadyAcquired } = useExclusiveLock();
  const { debug } = useLogger('eee');

  return combineLatest([Binance.useOrder(id, instrument).pipe(), interval(1000)]).pipe(
    map(([it]) => it),
    takeWhile(it => it !== orderNotFound),
    exclude(orderNotFound),
    tap(() => console.log('checking..')),
    filter(it => it.createdAt + 1000 * 10 < now()),
    finalize(() => debug('canceling')),
    take(1),
    switchMap(it => Binance.useOrderCancel(it)),
    finalize(() => debug('DONE'))
  );
};
