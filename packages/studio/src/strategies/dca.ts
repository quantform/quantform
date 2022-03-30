import { BinanceAdapter } from '@quantform/binance';
import { instrumentOf, Session } from '@quantform/core';
import { SQLiteFeed } from '@quantform/sqlite';

import { studio } from '../index';

export const descriptor = {
  adapter: [new BinanceAdapter()],
  feed: SQLiteFeed(),
  simulation: {
    balance: {
      'binance:btc': 1,
      'binance:usdt': 100
    }
  },
  layout: layout({
    children: [
      linear({ name: 'OrderList' }),
      linear({ name: 'OrderList' }),
      linear({ name: 'OrderList' })
    ]
  })
};

export default studio(3000, (session: Session) =>
  session.trade(instrumentOf('binance:btc-usdt'))
);

interface ChartLayer {
  name: string;
}

function layout(layout: { children: ChartLayer[] }) {
  return layout;
}

function linear({ name: string }): ChartLayer {}
