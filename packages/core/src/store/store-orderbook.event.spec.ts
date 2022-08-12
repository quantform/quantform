import { Store } from '..';
import { Asset, Instrument } from '../domain';
import { d, now } from '../shared';
import { OrderbookPatchAsksEvent } from '.';

const instrument = new Instrument(
  new Asset('btc', 'binance', 8),
  new Asset('usdt', 'binance', 2),
  'binance:btc-usdt'
);

describe('OrderbookPatchLiquidityEvent', () => {
  let store: Store;

  beforeEach(() => {
    store = new Store();
    store.snapshot.universe.instrument.upsert(instrument);
    store.snapshot.subscription.instrument.upsert(instrument);
  });

  test('should set a best bid and ask', () => {
    const timestamp = now();

    const ask = { rate: d(2), quantity: d(2) };

    store.dispatch(
      new OrderbookPatchAsksEvent(instrument, ask.rate, ask.quantity, timestamp)
    );

    const orderbook = store.snapshot.orderbook.get(instrument.id);

    expect(orderbook.timestamp).toEqual(timestamp);
    expect(orderbook.instrument.id).toEqual(orderbook.instrument.id);
    expect(orderbook.asks).toEqual(ask);
    expect(store.snapshot.timestamp).toEqual(timestamp);
  });

  test('should patch a best bid and ask', () => {
    const timestamp = now();

    const input = [
      { rate: d(2), quantity: d(2) },
      { rate: d(2), quantity: d(3) },
      { rate: d(5), quantity: d(1) },
      { rate: d(5), quantity: d(2) },
      { rate: d(3), quantity: d(1) },
      { rate: d(1), quantity: d(8) },
      { rate: d(1), quantity: d(0) },
      { rate: d(3), quantity: d(0) },
      { rate: d(5), quantity: d(0) }
    ];

    input.forEach(it =>
      store.dispatch(
        new OrderbookPatchAsksEvent(instrument, it.rate, it.quantity, timestamp)
      )
    );

    const orderbook = store.snapshot.orderbook.get(instrument.id);

    const volume = orderbook.asks.reduce(
      (it, agg) => agg.add(it.quantity.mul(it.rate)),
      d.Zero
    );

    expect(orderbook.timestamp).toEqual(timestamp);
    expect(orderbook.instrument.id).toEqual(orderbook.instrument.id);
    expect(orderbook.asks.rate).toEqual(d(2));
    expect(orderbook.asks.quantity).toEqual(d(3));
    expect(store.snapshot.timestamp).toEqual(timestamp);
    expect(volume).toEqual(d(6));
  });
});
