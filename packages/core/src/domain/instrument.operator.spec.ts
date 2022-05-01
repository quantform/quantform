import { Subject } from 'rxjs';

import { State } from '../store';
import { Asset } from './asset';
import { Component } from './component';
import { Instrument, instrumentOf } from './instrument';
import { instrument } from './instrument.operator';

describe('instrument', () => {
  const state = new State();

  beforeEach(() => {
    state.universe.instrument.upsert(
      new Instrument(new Asset('abc', 'xyz', 4), new Asset('def', 'xyz', 4), 'abc-def')
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
