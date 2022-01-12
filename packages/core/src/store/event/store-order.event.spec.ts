import { now } from '../../shared';
import { Asset, Instrument, Order } from '../../domain';
import { OrderLoadEvent } from './store-order.event';
import { Store } from '../store';

const instrument = new Instrument(
  new Asset('btc', 'binance', 8),
  new Asset('usdt', 'binance', 2),
  'binance:btc-usdt'
);

describe('order load event tests', () => {
  test('should load order to store', () => {
    const timestamp = now();
    const store = new Store();
    const order = Order.buyMarket(instrument, 1.0);

    order.state = 'PENDING';

    store.snapshot.universe.instrument[instrument.toString()] = instrument;
    store.snapshot.subscription.instrument[instrument.toString()] = instrument;

    store.dispatch(new OrderLoadEvent(order, timestamp));

    expect(Object.keys(store.snapshot.order.pending).length).toEqual(1);
    expect(store.snapshot.order.pending[order.id]).toEqual(order);
  });
});
