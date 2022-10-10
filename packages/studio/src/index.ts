import { Session } from '@quantform/core';
import { defer, from, Observable, switchMap } from 'rxjs';

import { createStudySession, StudySession, StudySessionOptions } from './study-session';

export type { StudySession, StudySessionOptions, getStudySession } from './study-session';
export {
  layout,
  pane,
  area,
  bar,
  candlestick,
  histogram,
  linear,
  marker
} from './models';

export function study(
  options: StudySessionOptions,
  delegate: (session: StudySession) => Observable<any>
) {
  return (session: Session) =>
    from(createStudySession(options, session)).pipe(
      switchMap(session => defer(() => delegate(session)))
    );
}
