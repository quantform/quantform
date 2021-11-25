import { State } from '../';
import { now } from '../../shared';
import { Asset, Instrument, Order } from '../../domain';
import { OrderLoadEvent, OrderLoadEventHandler } from './store-order.event';

const instrument = new Instrument(
  new Asset('btc', 'binance', 8),
  new Asset('usdt', 'binance', 2),
  'binance:btc-usdt'
);

describe('order load event tests', () => {
  test('should load order to store', () => {
    const timestamp = now();
    const state = new State();
    const order = Order.buyMarket(instrument, 1.0);

    order.state = 'PENDING';

    state.universe.instrument[instrument.toString()] = instrument;
    state.subscription.instrument[instrument.toString()] = instrument;

    OrderLoadEventHandler(new OrderLoadEvent(order, timestamp), state);

    expect(Object.keys(state.order.pending).length).toEqual(1);
    expect(state.order.pending[order.id]).toEqual(order);
  });
});
