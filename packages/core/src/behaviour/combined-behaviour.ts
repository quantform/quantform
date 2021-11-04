import { forkJoin, Observable } from 'rxjs';
import { Session } from '../session';
import { Behaviour } from './behaviour';

export class CombinedBehaviour implements Behaviour {
  constructor(private readonly behaviours: Behaviour[]) {}

  describe(session: Session): Observable<any> {
    return forkJoin(this.behaviours.map(b => b.describe(session)));
  }

  statement?(output: Record<string, any>): void {
    this.behaviours.forEach(it => it.statement && it.statement(output));
  }
}

export class FunctionBehaviour implements Behaviour {
  constructor(private readonly func: (session: Session) => Observable<any>) {}

  describe(session: Session): Observable<any> {
    return this.func(session);
  }
}
