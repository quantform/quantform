import { PaperAdapter } from '../paper-adapter';
import {
  Asset,
  assetOf,
  Candle,
  Commission,
  commissionPercentOf,
  instrumentOf,
  InstrumentSelector,
  Order
} from './../../../domain';
import {
  BalancePatchEvent,
  InstrumentPatchEvent,
  InstrumentSubscriptionEvent,
  Store,
  TradePatchEvent
} from './../../../store';
import {
  Adapter,
  AdapterTimeProvider,
  DefaultTimeProvider,
  FeedQuery,
  HistoryQuery
} from './../../adapter';
import { PaperSimulator } from './paper-simulator';
import { PaperSpotSimulator } from './paper-spot-simulator';

class DefaultAdapter extends Adapter {
  dispose(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  subscribe(instruments: InstrumentSelector[]): Promise<void> {
    throw new Error('Method not implemented.');
  }
  account(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  open(order: Order): Promise<void> {
    throw new Error('Method not implemented.');
  }
  cancel(order: Order): Promise<void> {
    throw new Error('Method not implemented.');
  }
  history(query: HistoryQuery): Promise<Candle[]> {
    throw new Error('Method not implemented.');
  }
  feed(query: FeedQuery): Promise<void> {
    throw new Error('Method not implemented.');
  }
  name = 'default';

  timestamp() {
    return 0;
  }

  constructor(timeProvider: AdapterTimeProvider, private readonly store: Store) {
    super(timeProvider);
  }

  async awake(): Promise<void> {
    this.store.dispatch(
      new InstrumentPatchEvent(
        this.timestamp(),
        new Asset('a', this.name, 8),
        new Asset('b', this.name, 4),
        new Commission(0.1, 0.1),
        'a-b'
      )
    );
  }

  createPaperSimulator(adapter: PaperAdapter): PaperSimulator {
    return new PaperSpotSimulator(adapter);
  }
}

describe('paper spot simulator tests', () => {
  const options = {
    balance: {
      ['default:a']: 1000,
      ['default:b']: 200
    }
  };

  test('should open an market order', async () => {
    const store = new Store();
    const adapter = new DefaultAdapter(DefaultTimeProvider, store);
    const order = Order.market(instrumentOf('default:a-b'), 1);

    store.dispatch(
      new InstrumentPatchEvent(
        0,
        new Asset('a', 'default', 8),
        new Asset('b', 'default', 4),
        commissionPercentOf({
          maker: 0.1,
          taker: 0.1
        }),
        'a-b'
      ),
      new BalancePatchEvent(assetOf('default:a'), 1000, 0, 1)
    );
    store.dispatch(new BalancePatchEvent(assetOf('default:b'), 1000, 0, 1));
    store.dispatch(new InstrumentSubscriptionEvent(1, instrumentOf('default:a-b'), true));

    const sut = new PaperSpotSimulator(new PaperAdapter(adapter, store, options));

    await sut.open(order);

    expect(store.snapshot.order.get(order.instrument.id).get(order.id).state).toBe(
      'PENDING'
    );

    store.dispatch(new TradePatchEvent(instrumentOf('default:a-b'), 5, 1, 2));

    const storeOrder = store.snapshot.order.get(order.instrument.id).get(order.id);

    expect(storeOrder.quantity).toBe(1);
    expect(storeOrder.averageExecutionRate).toBe(5);
    expect(storeOrder.state).toBe('FILLED');
    expect(store.snapshot.balance.get('default:b').free).toBe(995);
    expect(store.snapshot.balance.get('default:a').free).toBe(1000.999);
  });
});
