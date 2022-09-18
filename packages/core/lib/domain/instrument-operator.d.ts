import { Observable } from 'rxjs';
import { State } from '../store';
import { Component } from './component';
import { Instrument, InstrumentSelector } from './instrument';
export declare function instrument(selector: InstrumentSelector, state: State): (source$: Observable<Component>) => Observable<Instrument>;
export declare function instruments(state: State): (source$: Observable<Component>) => Observable<readonly Instrument[]>;
//# sourceMappingURL=instrument-operator.d.ts.map