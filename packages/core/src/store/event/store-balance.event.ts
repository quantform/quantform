import { timestamp } from '../../common';
import { Component } from '../../domain';
import { AssetSelector } from '../../domain/asset';
import { Balance } from '../../domain/balance';
import { State } from '../store.state';
import { ExchangeStoreEvent } from './store.event';

export class BalancePatchEvent implements ExchangeStoreEvent {
  type = 'balance-patch';

  constructor(
    readonly asset: AssetSelector,
    readonly free: number,
    readonly freezed: number,
    readonly timestamp: timestamp
  ) {}

  applicable(): boolean {
    return true;
  }

  execute(state: State): Component | Component[] {
    let balance = state.balance[this.asset.toString()];

    if (!balance) {
      const asset = state.universe.asset[this.asset.toString()];

      if (!asset) {
        return;
      }

      balance = new Balance(asset);

      state.balance[asset.toString()] = balance;
    }

    balance.timestamp = this.timestamp;
    balance.set(this.free, this.freezed);

    return balance;
  }
}

export class BalanceTransactEvent implements ExchangeStoreEvent {
  type = 'balance-transact';

  constructor(
    readonly asset: AssetSelector,
    readonly amount: number,
    readonly timestamp: timestamp
  ) {}

  applicable(): boolean {
    return true;
  }

  execute(state: State): Component | Component[] {
    let balance = state.balance[this.asset.toString()];

    if (!balance) {
      const asset = state.universe.asset[this.asset.toString()];

      balance = new Balance(asset);

      state.balance[asset.toString()] = balance;
    }

    balance.transact(this.amount);

    return balance;
  }
}

export class BalanceFreezEvent implements ExchangeStoreEvent {
  type = 'balance-freez';

  constructor(
    readonly asset: AssetSelector,
    readonly amount: number,
    readonly timestamp: timestamp
  ) {}

  applicable(): boolean {
    return true;
  }

  execute(state: State): Component | Component[] {
    const balance = state.balance[this.asset.toString()];

    if (!balance) {
      throw new Error('invalid balance');
    }

    balance.freez(this.amount);

    return balance;
  }
}

export class BalanceUnfreezEvent implements ExchangeStoreEvent {
  type = 'balance-unfreez';

  constructor(
    readonly asset: AssetSelector,
    readonly amount: number,
    readonly timestamp: timestamp
  ) {}

  applicable(): boolean {
    return true;
  }

  execute(state: State): Component | Component[] {
    const balance = state.balance[this.asset.toString()];

    if (!balance) {
      throw new Error('invalid balance');
    }

    balance.unfreez(this.amount);

    return balance;
  }
}
