import { Asset, Instrument, Order } from '../../domain';
import { now } from '../../shared';
import { Store } from '../store';
import { OrderLoadEvent } from './store-order.event';

const instrument = new Instrument(
  new Asset('btc', 'binance', 8),
  new Asset('usdt', 'binance', 2),
  'binance:btc-usdt'
);

describe('order load event tests', () => {
  test('should load order to store', () => {
    const timestamp = now();
    const store = new Store();
    const order = Order.market(instrument, 1.0);

    order.state = 'PENDING';

    store.snapshot.universe.instrument[instrument.toString()] = instrument;
    store.snapshot.subscription.instrument[instrument.toString()] = instrument;

    store.dispatch(new OrderLoadEvent(order, timestamp));

    expect(Object.keys(store.snapshot.order).length).toEqual(1);
    expect(store.snapshot.order[order.id]).toEqual(order);
  });
});
