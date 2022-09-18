import { Observable } from 'rxjs';
import { State } from '../store';
import { Component } from './component';
import { InstrumentSelector } from './instrument';
import { Order } from './order';
export declare function order(selector: InstrumentSelector): (source$: Observable<Component>) => Observable<Order>;
export declare function orders(selector: InstrumentSelector, state: State): (source$: Observable<Component>) => Observable<readonly Order[]>;
//# sourceMappingURL=order-operator.d.ts.map