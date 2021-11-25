import { PaperSpotExecutor } from '.';
import { Store } from '../../store';
import { Adapter } from '../adapter';
import { PaperExecutor } from './executor/paper-executor';
import { PaperAdapter } from './paper-adapter';

class DefaultAdapter extends Adapter {
  name = 'default';

  timestamp() {
    return 123;
  }

  createPaperExecutor(adapter: PaperAdapter): PaperExecutor {
    return new PaperSpotExecutor(adapter);
  }
}

describe('paper adapter tests', () => {
  test('should return wrapped adapter name and timestamp', () => {
    const adapter = new DefaultAdapter();
    const store = new Store();
    const options = {
      balance: {
        ['binance:usdt']: 1000
      }
    };

    const sut = new PaperAdapter(adapter, store, options);

    expect(sut.name).toEqual('default');
    expect(sut.timestamp()).toEqual(123);
  });
});
