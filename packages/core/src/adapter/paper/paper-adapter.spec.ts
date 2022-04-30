import { Cache, InMemoryStorage } from '../../storage';
import { InstrumentPatchEvent, Store } from '../../store';
import { AdapterContext } from '..';
import { Adapter, FeedQuery, HistoryQuery } from '../adapter';
import {
  Asset,
  Candle,
  Commission,
  instrumentOf,
  InstrumentSelector,
  Order
} from './../../domain';
import { PaperSpotSimulator } from '.';
import { PaperAdapter } from './paper-adapter';
import { PaperSimulator } from './simulator/paper-simulator';

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

  async awake(context: AdapterContext): Promise<void> {
    super.awake(context);

    context.dispatch(
      new InstrumentPatchEvent(
        context.timestamp,
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

describe('paper adapter tests', () => {
  const options = {
    balance: {
      ['default:a']: 1000,
      ['default:b']: 200
    }
  };

  test('should return wrapped adapter name and timestamp', () => {
    const store = new Store();

    const sut = new PaperAdapter(new DefaultAdapter(), store, options);

    expect(sut.name).toEqual('default');
    expect(sut.timestamp()).toEqual(123);
  });

  test('', async () => {
    const store = new Store();
    const adapter = new DefaultAdapter();
    const cache = new Cache(new InMemoryStorage());

    const sut = new PaperAdapter(adapter, store, options);

    await sut.awake(new AdapterContext(sut, store, cache));
    await sut.account();

    const order = Order.market(instrumentOf('default:a-b'), 1.0);

    await sut.open(order);

    expect(store.snapshot.order.get(order.instrument.id).get(order.id)).toEqual(order);
  });
});
