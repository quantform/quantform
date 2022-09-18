import { Observable } from 'rxjs';
import { State } from '../store';
import { Component } from './component';
import { InstrumentSelector } from './instrument';
import { Trade } from './trade';
export declare function trade(selector: InstrumentSelector, state: State): (source$: Observable<Component>) => Observable<Trade>;
//# sourceMappingURL=trade-operator.d.ts.map