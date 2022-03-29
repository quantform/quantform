import { BinanceAdapter } from '@quantform/binance';
import { instrumentOf, Session } from '@quantform/core';
import { SQLiteFeed } from '@quantform/sqlite';
import { tap } from 'rxjs';

import { studio } from '../index';

export const descriptor = {
  adapter: [new BinanceAdapter()],
  feed: SQLiteFeed(),
  simulation: {
    balance: {
      'binance:btc': 1,
      'binance:usdt': 100
    }
  }
};

export default studio(3000, (session: Session) =>
  session.trade(instrumentOf('binance:btc-usdt'))
);
