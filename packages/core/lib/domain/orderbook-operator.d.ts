import { Observable } from 'rxjs';
import { State } from '../store';
import { Component } from './component';
import { InstrumentSelector } from './instrument';
import { Orderbook } from './orderbook';
export declare function orderbook(selector: InstrumentSelector, state: State): (source$: Observable<Component>) => Observable<Orderbook>;
//# sourceMappingURL=orderbook-operator.d.ts.map