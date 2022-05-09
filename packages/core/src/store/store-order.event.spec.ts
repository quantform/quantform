import { Asset, Instrument, Order } from '../domain';
import { now } from '../shared';
import { Store } from '../store';
import { OrderLoadEvent } from './store-order.event';

const instrument = new Instrument(
  new Asset('btc', 'binance', 8),
  new Asset('usdt', 'binance', 2),
  'binance:btc-usdt'
);

describe('OrderLoadEvent', () => {
  test('should load order to store', () => {
    const timestamp = now();
    const store = new Store();
    const order = Order.market(instrument, 1.0);

    order.state = 'PENDING';

    store.snapshot.universe.instrument.upsert(instrument);
    store.snapshot.subscription.instrument.upsert(instrument);

    store.dispatch(new OrderLoadEvent(order, timestamp));

    expect(store.snapshot.order.asReadonlyArray().length).toEqual(1);
    expect(store.snapshot.order.get(instrument.id).get(order.id)).toEqual(order);
  });
});
