import { BinanceAdapter } from '@quantform/binance';
import { instrumentOf, Session } from '@quantform/core';
import { SQLiteFeed } from '@quantform/sqlite';

import { studio } from '../index';
import { layout, linear, pane } from '../modules/measurement/layout';

export const descriptor = {
  adapter: [new BinanceAdapter()],
  feed: SQLiteFeed(),
  simulation: {
    balance: {
      'binance:btc': 1,
      'binance:usdt': 100
    }
  },
  ...layout({
    children: [
      pane({
        background: '#fff',
        children: [
          linear({ name: 'best bid', transform: m => m.bestBid }),
          linear({ name: 'OrderList', transform: m => m.bestBid }),
          linear({ name: 'OrderList', transform: m => m.bestBid })
        ]
      })
    ]
  })
};

export default studio(3000, (session: Session) =>
  session.trade(instrumentOf('binance:btc-usdt'))
);
