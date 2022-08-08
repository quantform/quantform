import { decimal } from '../../shared';
import { InstrumentPatchEvent, Store } from '../../store';
import {
  Adapter,
  AdapterTimeProvider,
  DefaultTimeProvider,
  FeedQuery,
  HistoryQuery
} from '../adapter';
import {
  Asset,
  Candle,
  Commission,
  instrumentOf,
  InstrumentSelector,
  Order
} from './../../domain';
import { PaperEngine } from './engine/paper-engine';
import { PaperAdapter } from './paper-adapter';

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
    return 123;
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
        new Commission(new decimal(0.1), new decimal(0.1)),
        'a-b'
      )
    );
  }

  createPaperEngine(adapter: PaperAdapter): PaperEngine {
    return new PaperEngine(adapter.store);
  }
}

describe('PaperAdapter', () => {
  const options = {
    balance: {
      ['default:a']: 1000,
      ['default:b']: 200
    }
  };

  test('should return wrapped adapter name and timestamp', () => {
    const store = new Store();

    const sut = new PaperAdapter(
      new DefaultAdapter(DefaultTimeProvider, store),
      store,
      options
    );

    expect(sut.name).toEqual('default');
    expect(sut.timestamp()).toEqual(123);
  });

  test('', async () => {
    const store = new Store();
    const adapter = new DefaultAdapter(DefaultTimeProvider, store);

    const sut = new PaperAdapter(adapter, store, options);

    await sut.awake();
    await sut.account();

    const order = Order.market(instrumentOf('default:a-b'), new decimal(1.0));

    await sut.open(order);

    expect(store.snapshot.order.get(order.instrument.id).get(order.id)).toEqual(order);
  });
});
