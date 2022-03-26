import { BinanceAdapter } from '@quantform/binance';
import { Session, instrumentOf } from '@quantform/core';
import { SQLiteFeed } from '@quantform/sqlite';
import { take, tap } from 'rxjs';

import { studio } from '..';

export const descriptor = {
  adapter: [new BinanceAdapter()],
  feed: SQLiteFeed()
};

export default function (session: Session) {
  // studio(3000, session =>
  return session.trade(instrumentOf('binance:btc-usdt')).pipe(
    take(1),
    tap(it => console.log(it.rate))
  );
}
