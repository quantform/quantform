import { Measure, Session } from '@quantform/core';
import { Observable } from 'rxjs';
declare type Optional<T, K extends keyof T> = Omit<T, K> & Partial<T>;
export declare type StudySession = Session & {
    useMeasure<T extends {
        timestamp: number;
    }>(params: {
        kind: string;
        timestamp?: number;
    }, defaultValue?: T): [Observable<T>, (value: Optional<T, 'timestamp'>) => void];
    measurement$: Observable<Measure>;
};
export declare function sessionWithMeasurement(session: Session): StudySession;
export {};
//# sourceMappingURL=session.d.ts.map