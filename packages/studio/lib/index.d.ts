import { Session } from '@quantform/core';
import { Observable } from 'rxjs';
export * from './services';
export declare function study(port: number, delegate: (session: Session) => Observable<void>): (session: Session) => Observable<void>;
//# sourceMappingURL=index.d.ts.map