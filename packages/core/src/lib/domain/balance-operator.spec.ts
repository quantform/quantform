import { Subject } from 'rxjs';

import { State } from '../store';
import { Asset } from './asset';
import { Balance } from './balance';
import { balance } from './balance-operator';
import { Component } from './component';

describe('balance', () => {
  const timestamp = 0;
  const asset = new Asset('abc', 'xyz', 4);
  const state = new State();

  beforeEach(() => {
    state.balance.upsert(new Balance(timestamp, asset));
  });

  test('should pipe a balance snapshot when subscribed', done => {
    new Subject<Component>().pipe(balance(asset, state)).subscribe({
      next: it => {
        expect(it.asset).toEqual(asset);
        done();
      }
    });
  });
});
