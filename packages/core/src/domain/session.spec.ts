import { Asset, Commission, Session, SessionBuilder } from '@lib/domain';
import { d, now } from '@lib/shared';
import { InstrumentPatchEvent } from '@lib/store';

describe(Session.name, () => {
  test('should trigger once', done => {
    const session = new SessionBuilder().paper();

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
