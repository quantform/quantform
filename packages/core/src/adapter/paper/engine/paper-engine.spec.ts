import { Asset, commissionPercentOf, Instrument, Order } from '../../../domain';
import { d, now } from '../../../shared';
import {
  BalancePatchEvent,
  InstrumentPatchEvent,
  InstrumentSubscriptionEvent,
  OrderbookSnapshotEvent,
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
    maker: d(0.1),
    taker: d(0.1)
  });

  test('should open a new buy market order', () => {
    const store = new Store();
    const engine = new PaperEngine(store);
    const order = Order.market(instrument, d(1.0));

    store.dispatch(
      new InstrumentPatchEvent(now(), instrument.base, instrument.quote, commission, ''),
      new BalancePatchEvent(instrument.base, d(1), d.Zero, now()),
      new BalancePatchEvent(instrument.quote, d(1000), d.Zero, now())
    );

    engine.open(order);

    expect(store.snapshot.order.asReadonlyArray().length).toEqual(1);
    expect(store.snapshot.order.get(instrument.id).get(order.id)).toEqual(order);
    expect(store.snapshot.balance.get(instrument.quote.id).free).toEqual(d.Zero);
    expect(store.snapshot.balance.get(instrument.quote.id).locked).toEqual(d(1000));
  });

  test('should open a new sell market order', () => {
    const store = new Store();
    const engine = new PaperEngine(store);
    const order = Order.market(instrument, d(-0.6));

    store.dispatch(
      new InstrumentPatchEvent(now(), instrument.base, instrument.quote, commission, ''),
      new BalancePatchEvent(instrument.base, d(1), d.Zero, now()),
      new BalancePatchEvent(instrument.quote, d(1000), d.Zero, now())
    );

    engine.open(order);

    expect(store.snapshot.order.asReadonlyArray().length).toEqual(1);
    expect(store.snapshot.order.get(instrument.id).get(order.id)).toEqual(order);
    expect(store.snapshot.balance.get(instrument.base.id).free).toEqual(d(0.4));
    expect(store.snapshot.balance.get(instrument.base.id).locked).toEqual(d(0.6));
  });

  test('should open and fill a new sell limit order', () => {
    const store = new Store();
    const engine = new PaperEngine(store);
    const order = Order.limit(instrument, d(-0.6), d(100));

    store.dispatch(
      new InstrumentPatchEvent(now(), instrument.base, instrument.quote, commission, ''),
      new BalancePatchEvent(instrument.base, d(1), d.Zero, now()),
      new BalancePatchEvent(instrument.quote, d(1000), d.Zero, now()),
      new InstrumentSubscriptionEvent(now(), instrument, true)
    );

    engine.open(order);

    expect(store.snapshot.order.asReadonlyArray().length).toEqual(1);
    expect(store.snapshot.order.get(instrument.id).get(order.id).state).toEqual(
      'PENDING'
    );
    expect(store.snapshot.balance.get(instrument.base.id).free).toEqual(d(0.4));
    expect(store.snapshot.balance.get(instrument.base.id).locked).toEqual(d(0.6));

    store.dispatch(
      new OrderbookSnapshotEvent(
        instrument,
        { rate: d(102), quantity: d(1) },
        { rate: d(101), quantity: d(1) },
        now()
      )
    );

    expect(store.snapshot.order.asReadonlyArray().length).toEqual(1);
    expect(store.snapshot.order.get(instrument.id).get(order.id).state).toEqual('FILLED');
    expect(store.snapshot.balance.get(instrument.base.id).free).toEqual(d(0.4));
    expect(store.snapshot.balance.get(instrument.base.id).locked).toEqual(d.Zero);
    expect(store.snapshot.balance.get(instrument.quote.id).free).toEqual(d(1060.53));
    expect(store.snapshot.balance.get(instrument.quote.id).locked).toEqual(d.Zero);
  });
});
