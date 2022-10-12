import { combineLatest, finalize, forkJoin, Observable, switchMap, take } from 'rxjs';

import { Session, SessionDescriptor } from './domain';
import { Logger } from './shared';

const registry: Record<string, () => SessionDescriptor> = {};

export let rule: (name: string, describe: (session: Session) => Observable<any>) => void;
export let beforeAll: (describe: (session: Session) => Observable<any>) => void;
export let context: () => Session;

export function describe(name: string, describe: () => SessionDescriptor) {
  registry[name] = describe;
}

export function prepare(name: string) {
  const describe = registry[name];
  const rules = new Array<(session: Session) => Observable<any>>();
  const beforeAlls = new Array<(session: Session) => Observable<any>>();

  beforeAll = (describe: (session: Session) => Observable<any>) => {
    beforeAlls.push(describe);
  };

  rule = (ruleName: string, describe: (session: Session) => Observable<any>) => {
    Logger.info(name, ruleName);

    rules.push(describe);
  };

  const descriptor = describe();
  const register = (session: Session) =>
    combineLatest(beforeAlls.map(it => it(session))).pipe(
      take(1),
      switchMap(() => forkJoin(rules.map(it => it(session)))),
      finalize(() => session.dispose())
    );

  return { descriptor, register };
}
