import { InstrumentPatchEvent } from '../store/event';
import { Asset, Commision } from '../domain';
import { SessionFactory } from './session.factory';
import { now } from '../common';
import { SessionDescriptor } from './session.descriptor';

describe('session tests', () => {
  const descriptor: SessionDescriptor = {
    awake: () => Promise.resolve(),
    dispose: () => Promise.resolve(),
    measurement: () => null,
    adapter: () => [],
    options: () => ({
      from: 0,
      to: 0,
      feed: null,
      balance: {
        ['binance:btc']: 1.23
      }
    })
  };

  test('should trigger once', done => {
    const session = SessionFactory.paper(descriptor);

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
