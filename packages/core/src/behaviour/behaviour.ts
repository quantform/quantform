import { Observable } from 'rxjs';
import { Session } from '../session';

export interface Behaviour {
  describe(session: Session): Observable<any>;
  statement?(output: Record<string, any>): void;
}
