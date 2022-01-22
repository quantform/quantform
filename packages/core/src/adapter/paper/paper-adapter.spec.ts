import { PaperSpotExecutor } from '.';
import { AdapterContext } from '..';
import { Store } from '../../store';
import { Adapter } from '../adapter';
import { PaperExecutor } from './executor/paper-executor';
import { PaperAdapter } from './paper-adapter';
import { Order, Asset, Commission, assetOf } from './../../domain';
import { instrumentOf } from './../../domain/instrument';
import { BalancePatchEvent, InstrumentPatchEvent } from '../../store/event';

class DefaultAdapter extends Adapter {
  name = 'default';

  timestamp() {
    return 123;
  }

  async awake(context: AdapterContext): Promise<void> {
    super.awake(context);

    context.store.dispatch(
      new InstrumentPatchEvent(
        context.timestamp,
        new Asset('a', this.name, 8),
        new Asset('b', this.name, 4),
        new Commission(0.1, 0.1),
        'a-b'
      )
    );
  }

  createPaperExecutor(adapter: PaperAdapter): PaperExecutor {
    return new PaperSpotExecutor(adapter);
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

    const sut = new PaperAdapter(adapter, store, options);

    await sut.awake(new AdapterContext(sut, store));
    await sut.account();

    const order = Order.buyMarket(instrumentOf('default:a-b'), 1.0);

    await sut.open(order);

    expect(store.snapshot.order[order.id]).toEqual(order);
  });
});
