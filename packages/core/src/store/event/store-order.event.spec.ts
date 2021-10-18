import { Store } from '..';
import { now } from '../../common';
import { instrumentOf, Order } from '../../domain';
import { OrderLoadEvent } from './store-order.event';

describe('order load event tests', () => {
  test('should load order to store', () => {
    const timestamp = now();
    const store = new Store();
    const order = Order.buyMarket(instrumentOf('cex:de30-usd'), 1.0);

    order.state = 'PENDING';

    store.dispatch(new OrderLoadEvent(order, timestamp));

    expect(Object.keys(store.snapshot.order.pending).length).toEqual(1);
    expect(store.snapshot.order.pending[order.id]).toEqual(order);
  });
});
