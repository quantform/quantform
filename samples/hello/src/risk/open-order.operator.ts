import { combineLatest, filter, map, Observable, of } from 'rxjs';

import {
  AssetSelector,
  Balance,
  decimal,
  InstrumentSelector,
  Orderbook,
  Trade
} from '@quantform/core';

export function fromTrade(selector: InstrumentSelector): Observable<Trade> {
  return of();
}

function fromBalance(selector: AssetSelector): Observable<Balance> {
  return of();
}

export function fromOrderbook(instrument: InstrumentSelector): Observable<Orderbook> {
  return of();
}

function fromBestBuyLimitRate(instrument: InstrumentSelector): Observable<decimal> {
  return fromOrderbook(instrument).pipe(map(it => it.bids.rate));
}

function fromBuyingPower(instrument: InstrumentSelector): Observable<decimal> {
  return combineLatest([
    fromBalance(instrument.quote),
    fromBestBuyLimitRate(instrument)
  ]).pipe(map(([balance, rate]) => balance.free.div(rate)));
}

function fromCandle(instrument: InstrumentSelector) {
  return fromTrade(instrument).pipe(oclc);
}
