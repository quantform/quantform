import { Observable } from 'rxjs';
import { Session, SessionDescriptor } from './../../domain';
export declare type StrategyModule = {
    descriptor: SessionDescriptor;
    default: (session: Session) => Observable<any>;
};
export declare function buildDirectory(): string;
export declare function getModule(name: string): Promise<StrategyModule>;
//# sourceMappingURL=workspace.d.ts.map