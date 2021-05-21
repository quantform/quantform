import { now } from '../../common';
import { instrumentOf, Order } from '../../domain';
import { State } from '../store.state';
import { OrderLoadEvent } from './store-order.event';

describe('order load event tests', () => {
  test('should load order to store', () => {
    const timestamp = now();
    const state = new State();
    const order = Order.buyMarket(instrumentOf('cex:de30-usd'), 1.0);

    order.state = 'PENDING';

    const event = new OrderLoadEvent(order, timestamp);

    event.execute(state);

    expect(Object.keys(state.order.pending).length).toEqual(1);
    expect(state.order.pending[order.id]).toEqual(order);
  });
});
