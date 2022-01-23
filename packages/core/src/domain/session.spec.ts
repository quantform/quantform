import { InstrumentPatchEvent } from '../store/event';
import { Asset, Commission } from '../domain';
import { now } from '../shared';
import { SessionDescriptor } from './session';
import { Bootstrap } from '../bootstrap';

describe('session tests', () => {
  const descriptor: SessionDescriptor = {
    id: now(),
    adapter: []
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
        new Commission(0, 0),
        ''
      ),
      new InstrumentPatchEvent(
        now(),
        new Asset('wig20', 'cex', 2),
        new Asset('pln', 'cex', 2),
        new Commission(0, 0),
        ''
      )
    );
  });
});
