import { Order } from '../../../domain';
import { Store } from '../../../store';
export declare class PaperEngine {
    private readonly store;
    constructor(store: Store);
    open(order: Order): void;
    cancel(order: Order): void;
    private onOrderbook;
    private onTrade;
    private completeOrder;
}
//# sourceMappingURL=paper-engine.d.ts.map