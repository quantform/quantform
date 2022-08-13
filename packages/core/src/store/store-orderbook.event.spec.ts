import { Store } from '..';
import { Asset, Instrument, Liquidity } from '../domain';
import { d, now } from '../shared';
import { OrderbookPatchEvent } from '.';

const instrument = new Instrument(
  new Asset('btc', 'binance', 8),
  new Asset('usdt', 'binance', 2),
  'binance:btc-usdt'
);

describe('OrderbookPatchEvent', () => {
  let store: Store;

  beforeEach(() => {
    store = new Store();
    store.snapshot.universe.instrument.upsert(instrument);
    store.snapshot.subscription.instrument.upsert(instrument);
  });

  test('should set a best bid and ask', () => {
    const timestamp = now();

    const ask: Liquidity = { rate: d(2), quantity: d(2), next: undefined };
    const bid: Liquidity = { rate: d(1), quantity: d(1), next: undefined };

    store.dispatch(new OrderbookPatchEvent(instrument, ask, bid, timestamp));

    const orderbook = store.snapshot.orderbook.get(instrument.id);

    expect(orderbook.timestamp).toEqual(timestamp);
    expect(orderbook.instrument.id).toEqual(orderbook.instrument.id);
    expect(orderbook.asks).toEqual(ask);
    expect(orderbook.bids).toEqual(bid);
    expect(store.snapshot.timestamp).toEqual(timestamp);
  });
});
