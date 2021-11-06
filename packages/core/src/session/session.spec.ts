import { InstrumentPatchEvent } from '../store/event';
import { Asset, Commision } from '../domain';
import { now } from '../common';
import { SessionDescriptor } from './session-descriptor';
import { paper } from '../bin';

describe('session tests', () => {
  const descriptor: SessionDescriptor = {
    id: now(),
    adapter: []
  };

  test('should trigger once', done => {
    const session = paper(descriptor, {
      balance: {
        ['binance:btc']: 1.23
      }
    });

    session.instruments().subscribe({
      next: it => {
        expect(it.length).toEqual(2);
      },
      complete: done()
    });

    session.store.dispatch(
      new InstrumentPatchEvent(
        now(),
        new Asset('de30', 'cex', 2),
        new Asset('usd', 'cex', 2),
        new Commision(0, 0),
        ''
      ),
      new InstrumentPatchEvent(
        now(),
        new Asset('wig20', 'cex', 2),
        new Asset('pln', 'cex', 2),
        new Commision(0, 0),
        ''
      )
    );
  });
});
