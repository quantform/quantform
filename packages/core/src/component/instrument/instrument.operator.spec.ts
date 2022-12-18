import { Subject } from 'rxjs';

import {
  Asset,
  Commission,
  Component,
  fromInstrument,
  Instrument,
  instrumentOf
} from '@lib/component';
import { useContext } from '@lib/shared';
import { Store } from '@lib/store';

describe(fromInstrument.name, () => {
  const store = useContext(Store);

  beforeEach(() => {
    store.snapshot.universe.instrument.upsert(
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
    new Subject<Component>().pipe(fromInstrument(instrumentOf('xyz:abc-def'))).subscribe({
      next: it => {
        expect(it.id).toEqual('xyz:abc-def');
        done();
      }
    });
  });
});
