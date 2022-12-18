import { PaperEngine } from '@lib/adapter';
import { Asset, Commission, commissionPercentOf, Instrument, Order } from '@lib/component';
import { d, now } from '@lib/shared';
import {
  BalancePatchEvent,
  InstrumentPatchEvent,
  InstrumentSubscriptionEvent,
  OrderbookPatchEvent,
  Store
} from '@lib/store';

describe('PaperEngine', () => {
  const instrument = new Instrument(
    0,
    new Asset('btc', 'binance', 8),
    new Asset('usdt', 'binance', 2),
    'binance:btc-usdt',
    Commission.Zero
  );

  const commission = commissionPercentOf({
    maker: d(0.1),
    taker: d(0.1)
  });

  test('should open a new buy market order', () => {
    const store = new Store();
    const engine = new PaperEngine(store);
    const order = new Order(0, '1', instrument, d(1.0), 0);

    store.dispatch(
      new InstrumentPatchEvent(now(), instrument.base, instrument.quote, commission, ''),
      new BalancePatchEvent(instrument.base, d(1), d.Zero, now()),
      new BalancePatchEvent(instrument.quote, d(1000), d.Zero, now())
    );

    engine.open(order);

    const pendingOrder = store.snapshot.order.get(instrument.id)?.get(order.id) ?? fail();
    const balance = store.snapshot.balance.get(instrument.quote.id) ?? fail();

    expect(store.snapshot.order.asReadonlyArray().length).toEqual(1);
    expect(pendingOrder).toEqual(order);
    expect(balance.free).toEqual(d.Zero);
    expect(balance.locked).toEqual(d(1000));
  });

  test('should open a new sell market order', () => {
    const store = new Store();
    const engine = new PaperEngine(store);
    const order = new Order(0, '1', instrument, d(-0.6), 0);

    store.dispatch(
      new InstrumentPatchEvent(now(), instrument.base, instrument.quote, commission, ''),
      new BalancePatchEvent(instrument.base, d(1), d.Zero, now()),
      new BalancePatchEvent(instrument.quote, d(1000), d.Zero, now())
    );

    engine.open(order);

    const pendingOrder = store.snapshot.order.get(instrument.id)?.get(order.id) ?? fail();
    const balance = store.snapshot.balance.get(instrument.base.id) ?? fail();

    expect(store.snapshot.order.asReadonlyArray().length).toEqual(1);
    expect(pendingOrder).toEqual(order);
    expect(balance.free).toEqual(d(0.4));
    expect(balance.locked).toEqual(d(0.6));
  });

  test('should open and fill a new sell limit order', () => {
    const store = new Store();
    const engine = new PaperEngine(store);
    const order = new Order(0, '1', instrument, d(-0.6), 0, d(100));

    store.dispatch(
      new InstrumentPatchEvent(now(), instrument.base, instrument.quote, commission, ''),
      new BalancePatchEvent(instrument.base, d(1), d.Zero, now()),
      new BalancePatchEvent(instrument.quote, d(1000), d.Zero, now()),
      new InstrumentSubscriptionEvent(now(), instrument, true)
    );

    engine.open(order);

    const pendingOrder = store.snapshot.order.get(instrument.id)?.get(order.id) ?? fail();
    const baseBalance = store.snapshot.balance.get(instrument.base.id) ?? fail();

    expect(store.snapshot.order.asReadonlyArray().length).toEqual(1);
    expect(pendingOrder.state).toEqual('PENDING');
    expect(baseBalance.free).toEqual(d(0.4));
    expect(baseBalance.locked).toEqual(d(0.6));

    store.dispatch(
      new OrderbookPatchEvent(
        instrument,
        { rate: d(102), quantity: d(1), next: undefined },
        { rate: d(101), quantity: d(1), next: undefined },
        now()
      )
    );

    const quoteBalance = store.snapshot.balance.get(instrument.quote.id) ?? fail();

    expect(store.snapshot.order.asReadonlyArray().length).toEqual(1);
    expect(pendingOrder.state).toEqual('FILLED');
    expect(baseBalance.free).toEqual(d(0.4));
    expect(baseBalance.locked).toEqual(d(0.6));
    expect(quoteBalance.free).toEqual(d(1000));
    expect(quoteBalance.locked).toEqual(d.Zero);
  });
});
