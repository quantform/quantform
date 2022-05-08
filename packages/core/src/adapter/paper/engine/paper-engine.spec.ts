import { Asset, commissionPercentOf, Instrument, Order } from '../../../domain';
import { now } from '../../../shared';
import {
  BalancePatchEvent,
  InstrumentPatchEvent,
  InstrumentSubscriptionEvent,
  OrderbookPatchEvent,
  Store
} from '../../../store';
import { PaperEngine } from './paper-engine';

describe('PaperEngine', () => {
  const instrument = new Instrument(
    new Asset('btc', 'binance', 8),
    new Asset('usdt', 'binance', 2),
    'binance:btc-usdt'
  );

  const commission = commissionPercentOf({
    maker: 0.1,
    taker: 0.1
  });

  test('should open a new buy market order', () => {
    const store = new Store();
    const engine = new PaperEngine(store);
    const order = Order.market(instrument, 1.0);

    store.dispatch(
      new InstrumentPatchEvent(now(), instrument.base, instrument.quote, commission, ''),
      new BalancePatchEvent(instrument.base, 1, 0, now()),
      new BalancePatchEvent(instrument.quote, 1000, 0, now())
    );

    engine.open(order);

    expect(store.snapshot.order.asReadonlyArray().length).toEqual(1);
    expect(store.snapshot.order.get(instrument.id).get(order.id)).toEqual(order);
    expect(store.snapshot.balance.get(instrument.quote.id).free).toEqual(0);
    expect(store.snapshot.balance.get(instrument.quote.id).locked).toEqual(1000);
  });

  test('should open a new sell market order', () => {
    const store = new Store();
    const engine = new PaperEngine(store);
    const order = Order.market(instrument, -0.6);

    store.dispatch(
      new InstrumentPatchEvent(now(), instrument.base, instrument.quote, commission, ''),
      new BalancePatchEvent(instrument.base, 1, 0, now()),
      new BalancePatchEvent(instrument.quote, 1000, 0, now())
    );

    engine.open(order);

    expect(store.snapshot.order.asReadonlyArray().length).toEqual(1);
    expect(store.snapshot.order.get(instrument.id).get(order.id)).toEqual(order);
    expect(store.snapshot.balance.get(instrument.base.id).free).toEqual(0.4);
    expect(store.snapshot.balance.get(instrument.base.id).locked).toEqual(0.6);
  });

  test('should open and fill a new sell limit order', () => {
    const store = new Store();
    const engine = new PaperEngine(store);
    const order = Order.limit(instrument, -0.6, 100);

    store.dispatch(
      new InstrumentPatchEvent(now(), instrument.base, instrument.quote, commission, ''),
      new BalancePatchEvent(instrument.base, 1, 0, now()),
      new BalancePatchEvent(instrument.quote, 1000, 0, now()),
      new InstrumentSubscriptionEvent(now(), instrument, true)
    );

    engine.open(order);

    expect(store.snapshot.order.asReadonlyArray().length).toEqual(1);
    expect(store.snapshot.order.get(instrument.id).get(order.id).state).toEqual(
      'PENDING'
    );
    expect(store.snapshot.balance.get(instrument.base.id).free).toEqual(0.4);
    expect(store.snapshot.balance.get(instrument.base.id).locked).toEqual(0.6);

    store.dispatch(new OrderbookPatchEvent(instrument, 102, 1, 101, 1, now()));

    expect(store.snapshot.order.asReadonlyArray().length).toEqual(1);
    expect(store.snapshot.order.get(instrument.id).get(order.id).state).toEqual('FILLED');
    expect(store.snapshot.balance.get(instrument.base.id).free).toEqual(0.4);
    expect(store.snapshot.balance.get(instrument.base.id).locked).toEqual(0);
    expect(store.snapshot.balance.get(instrument.quote.id).free).toEqual(1060.53);
    expect(store.snapshot.balance.get(instrument.quote.id).locked).toEqual(0);
  });
});
