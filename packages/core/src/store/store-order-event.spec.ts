import { Asset, Balance, Commission, Instrument, Order } from '@lib/domain';
import { d, now } from '@lib/shared';
import { OrderLoadEvent, Store } from '@lib/store';

describe(OrderLoadEvent.name, () => {
  const instrument = new Instrument(
    0,
    new Asset('btc', 'binance', 8),
    new Asset('usdt', 'binance', 2),
    'binance:btc-usdt',
    Commission.Zero
  );

  test('should load order to store', () => {
    const timestamp = now();
    const store = new Store();
    const balance = new Balance(0, instrument.quote, d(1));
    const order = new Order(0, '1', instrument, d(1.0), 0);

    order.state = 'PENDING';

    store.snapshot.universe.instrument.upsert(instrument);
    store.snapshot.subscription.instrument.upsert(instrument);
    store.snapshot.balance.upsert(balance);

    store.dispatch(new OrderLoadEvent(order, timestamp));

    const pendingOrder = store.snapshot.order.get(instrument.id)?.get('1') ?? fail();

    expect(store.snapshot.order.asReadonlyArray().length).toEqual(1);
    expect(pendingOrder).toEqual(order);
  });
});
