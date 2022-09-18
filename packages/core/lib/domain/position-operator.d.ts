import { Observable } from 'rxjs';
import { decimal } from '../shared';
import { State } from '../store';
import { Component } from './component';
import { InstrumentSelector } from './instrument';
import { Position } from './position';
export declare function position(selector: InstrumentSelector): (source: Observable<Component>) => Observable<Readonly<Position>>;
export declare function positions(selector: InstrumentSelector, state: State): (source: Observable<Component>) => Observable<Readonly<Position>[]>;
export declare function flatten(): (source: Observable<Position[]>) => Observable<{
    size: decimal;
    rate: decimal;
}>;
//# sourceMappingURL=position-operator.d.ts.map