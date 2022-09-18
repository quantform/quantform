/// <reference types="react" />
import { SessionSnapshotContextState } from './session-snapshot-models';
export declare type SessionSnapshotContextType = SessionSnapshotContextState & {
    dispatch: React.Dispatch<SessionActions>;
};
export declare type SetSessionSnapshotAction = SessionSnapshotContextState & {
    type: 'snapshot';
};
export declare type PatchSessionSnapshotAction = SessionSnapshotContextState & {
    type: 'patch';
};
export declare type SessionActions = SetSessionSnapshotAction | PatchSessionSnapshotAction;
export declare const useSessionSnapshotContext: () => SessionSnapshotContextType;
export declare const SessionSnapshotProvider: ({ children }: {
    children: React.ReactNode;
}) => JSX.Element;
//# sourceMappingURL=session-snapshot-context.d.ts.map