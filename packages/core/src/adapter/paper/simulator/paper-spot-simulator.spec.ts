import { PaperAdapter } from '../paper-adapter';
import {
  Asset,
  assetOf,
  Commission,
  commissionPercentOf,
  instrumentOf,
  Order
} from './../../../domain';
import {
  BalancePatchEvent,
  InstrumentPatchEvent,
  InstrumentSubscriptionEvent,
  Store,
  TradePatchEvent
} from './../../../store';
import { Adapter, AdapterContext } from './../../adapter';
import { PaperSimulator } from './paper-simulator';
import { PaperSpotSimulator } from './paper-spot-simulator';

class DefaultAdapter extends Adapter {
  name = 'default';

  timestamp() {
    return 0;
  }

  async awake(context: AdapterContext): Promise<void> {
    await super.awake(context);

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

describe('paper spot simulator tests', () => {
  const options = {
    balance: {
      ['default:a']: 1000,
      ['default:b']: 200
    }
  };

  test('should open an market order', async () => {
    const store = new Store();
    const adapter = new DefaultAdapter();
    const order = Order.buyMarket(instrumentOf('default:a-b'), 1);

    store.dispatch(
      new InstrumentPatchEvent(
        0,
        new Asset('a', 'default', 8),
        new Asset('b', 'default', 4),
        commissionPercentOf(0.1, 0.1),
        'a-b'
      ),
      new BalancePatchEvent(assetOf('default:a'), 1000, 0, 1)
    );
    store.dispatch(new BalancePatchEvent(assetOf('default:b'), 1000, 0, 1));
    store.dispatch(new InstrumentSubscriptionEvent(1, instrumentOf('default:a-b'), true));

    const sut = new PaperSpotSimulator(new PaperAdapter(adapter, store, options));

    await sut.open(order);

    expect(store.snapshot.order[order.id].state).toBe('PENDING');

    store.dispatch(new TradePatchEvent(instrumentOf('default:a-b'), 5, 1, 2));

    expect(store.snapshot.order[order.id].quantity).toBe(1);
    expect(store.snapshot.order[order.id].averageExecutionRate).toBe(5);
    expect(store.snapshot.order[order.id].state).toBe('FILLED');
    expect(store.snapshot.balance['default:b'].free).toBe(995);
    expect(store.snapshot.balance['default:a'].free).toBe(1000.999);
  });
});
