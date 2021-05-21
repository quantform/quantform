import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { State } from './store.state';
import { AssetSelector, Component, InstrumentSelector } from '../domain';
import { Set } from 'typescript-collections';
import { ExchangeStoreEvent } from './event/store.event';

export class Store {
  private readonly changes = new Subject<Component>();
  private readonly state = new BehaviorSubject<State>(new State());
  private readonly notification = new Set<Component>();

  get state$(): Observable<State> {
    return this.state.asObservable();
  }

  get changes$(): Observable<Component> {
    return this.changes.asObservable();
  }

  get snapshot(): State {
    return this.state.value;
  }

  dispatch(...events: ExchangeStoreEvent[]) {
    const state = this.state.value;

    for (const event of events) {
      if (!event.applicable(state)) {
        continue;
      }

      state.timestamp = event.timestamp;

      const component = event.execute(state);

      if (component != null) {
        if (Array.isArray(component)) {
          component.forEach(it => this.notification.add(it));
        } else {
          this.notification.add(component);
        }
      }
    }

    const queue = this.notification.toArray();
    this.notification.clear();

    while (queue.length > 0) {
      const target = queue.pop();

      target.timestamp = state.timestamp;

      this.changes.next(target);
    }
  }

  subscribe(selector: InstrumentSelector | AssetSelector) {
    const state = this.state.value;

    if (selector instanceof InstrumentSelector) {
      state.subscription.instrument[selector.toString()] = selector;
      state.subscription.asset[selector.base.toString()] = selector.base;
      state.subscription.asset[selector.quote.toString()] = selector.quote;

      this.state.next(state);
    }

    if (selector instanceof AssetSelector) {
      state.subscription.asset[selector.toString()] = selector;

      this.state.next(state);
    }
  }
}
