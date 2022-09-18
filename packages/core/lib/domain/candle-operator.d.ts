import { Observable } from 'rxjs';
import { decimal } from '../shared';
import { Candle } from './candle';
export declare function candle<T extends {
    timestamp: number;
}>(timeframe: number, fn: (x: T) => decimal, candleToStartWith?: Candle): (source: Observable<T>) => Observable<Candle>;
export declare function mergeCandle<T extends {
    timestamp: number;
}>(timeframe: number, fn: (x: T) => decimal, history$: Observable<Candle>): (source$: Observable<T>) => Observable<Candle>;
export declare function candleCompleted(): (source: Observable<Candle>) => Observable<Candle>;
//# sourceMappingURL=candle-operator.d.ts.map