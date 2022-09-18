import { Bootstrap } from '../bootstrap';
import { Asset, Commission } from '../domain';
import { d, now } from '../shared';
import { InstrumentPatchEvent } from '../store';
import { SessionDescriptor } from './session';

describe('Session', () => {
  const descriptor: SessionDescriptor = {
    id: now(),
    adapter: [],
    simulation: {
      balance: {},
      from: 0,
      to: 0
    }
  };

  test('should trigger once', done => {
    const session = new Bootstrap(descriptor).paper();

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
        new Commission(d.Zero, d.Zero),
        ''
      ),
      new InstrumentPatchEvent(
        now(),
        new Asset('wig20', 'cex', 2),
        new Asset('pln', 'cex', 2),
        new Commission(d.Zero, d.Zero),
        ''
      )
    );
  });
});
