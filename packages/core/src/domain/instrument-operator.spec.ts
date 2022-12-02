import { Subject } from 'rxjs';

import {
  Asset,
  Commission,
  Component,
  Instrument,
  instrument,
  instrumentOf
} from '@lib/domain';
import { State } from '@lib/store';

describe(instrument.name, () => {
  const state = new State();

  beforeEach(() => {
    state.universe.instrument.upsert(
      new Instrument(
        0,
        new Asset('abc', 'xyz', 4),
        new Asset('def', 'xyz', 4),
        'abc-def',
        Commission.Zero
      )
    );
  });

  test('should pipe an instrument on subscription', done => {
    new Subject<Component>()
      .pipe(instrument(instrumentOf('xyz:abc-def'), state))
      .subscribe({
        next: it => {
          expect(it.id).toEqual('xyz:abc-def');
          done();
        }
      });
  });
});
