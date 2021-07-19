import { timestamp } from '../../common';
import { Component } from '../../domain';
import { State } from '../store.state';

export interface ExchangeStoreEvent {
  type: string;
  timestamp: timestamp;

  applicable(state: State): boolean;
  execute(state: State): Component | Component[];
}
