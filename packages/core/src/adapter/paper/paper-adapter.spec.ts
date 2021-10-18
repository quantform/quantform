import { PaperSpotModel } from '.';
import { Store } from '../../store';
import { Adapter } from '../adapter';
import { PaperModel } from './model/paper-model';
import { PaperAdapter } from './paper-adapter';

class DefaultAdapter extends Adapter {
  name = 'default';

  timestamp() {
    return 123;
  }

  createPaperModel(adapter: PaperAdapter): PaperModel {
    return new PaperSpotModel(adapter);
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
