import { Observable } from 'rxjs';
import { State } from '../store';
import { AssetSelector } from './asset';
import { Balance } from './balance';
import { Component } from './component';
export declare function balance(selector: AssetSelector, state: State): (source$: Observable<Component>) => Observable<Balance>;
//# sourceMappingURL=balance-operator.d.ts.map