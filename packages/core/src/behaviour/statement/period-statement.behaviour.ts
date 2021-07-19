import { Observable } from 'rxjs';
import { Session } from '../../session';
import { Behaviour } from '..';
import { map } from 'rxjs/operators';

export class PeriodStatementBehaviour implements Behaviour {
  private from: number;
  private to: number;

  describe(session: Session): Observable<any> {
    return session.store.changes$.pipe(
      map(it => {
        if (!this.from) {
          this.from = it.timestamp;
        }

        this.to = it.timestamp;
      })
    );
  }

  statement?(statement: Record<string, any>): void {
    statement['period_from'] = new Date(this.from).toISOString();
    statement['period_to'] = new Date(this.to).toISOString();
  }
}
