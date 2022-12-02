import { Asset, Commission, Instrument, Liquidity } from '@lib/domain';
import { d, now } from '@lib/shared';
import { OrderbookPatchEvent, Store } from '@lib/store';

describe(OrderbookPatchEvent.name, () => {
  const instrument = new Instrument(
    0,
    new Asset('btc', 'binance', 8),
    new Asset('usdt', 'binance', 2),
    'binance:btc-usdt',
    Commission.Zero
  );

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

    const orderbook = store.snapshot.orderbook.get(instrument.id) ?? fail();

    expect(orderbook.timestamp).toEqual(timestamp);
    expect(orderbook.instrument.id).toEqual(orderbook.instrument.id);
    expect(orderbook.asks).toEqual(ask);
    expect(orderbook.bids).toEqual(bid);
    expect(store.snapshot.timestamp).toEqual(timestamp);
  });
});
