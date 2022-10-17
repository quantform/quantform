import { Asset, Commission, Instrument, Order } from '../domain';
import { d, now } from '../shared';
import { Store } from '.';
import { OrderLoadEvent } from './store-order-event';

describe('OrderLoadEvent', () => {
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
    const order = new Order(0, '1', instrument, d(1.0), 0);

    order.state = 'PENDING';

    store.snapshot.universe.instrument.upsert(instrument);
    store.snapshot.subscription.instrument.upsert(instrument);

    store.dispatch(new OrderLoadEvent(order, timestamp));

    const pendingOrder = store.snapshot.order.get(instrument.id)?.get('1') ?? fail();

    expect(store.snapshot.order.asReadonlyArray().length).toEqual(1);
    expect(pendingOrder).toEqual(order);
  });
});
