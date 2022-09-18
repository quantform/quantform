import { BacktesterListener, BacktesterStreamer } from './adapter';
import { Session, SessionDescriptor } from './domain';
export declare class Bootstrap {
    readonly descriptor: SessionDescriptor;
    constructor(descriptor: SessionDescriptor);
    /**
     * Set session id.
     * @param id session id.
     */
    useSessionId(id?: number): Bootstrap;
    /**
     *
     * @param from
     * @param to
     */
    useBacktestPeriod(from: number, to: number): Bootstrap;
    /**
     * Starts a new backtest session.
     * @param listener backtest event listener.
     * @returns new session object.
     */
    backtest(listener?: BacktesterListener): [Session, BacktesterStreamer];
    /**
     * Starts a new paper session.
     * @returns new session object.
     */
    paper(): Session;
    /**
     * Starts a new live session.
     * @returns new session object.
     */
    live(): Session;
}
//# sourceMappingURL=bootstrap.d.ts.map