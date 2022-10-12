import { combineLatest, finalize, forkJoin, Observable, switchMap, take } from 'rxjs';

import { Plugin, Session, SessionBuilder } from './domain';
import { Logger } from './shared';

const registry: Record<string, () => Array<Plugin>> = {};

export let rule: (
  name: string | undefined,
  describe: (session: Session) => Observable<any>
) => void;

export let beforeAll: (describe: (session: Session) => Observable<any>) => void;
export let context: () => Session;

export function describe(name: string, describe: () => Array<Plugin>) {
  registry[name] = describe;
}

export async function prepare(name: string, builder: SessionBuilder) {
  const describe = registry[name];
  const rules = new Array<(session: Session) => Observable<any>>();
  const beforeAlls = new Array<(session: Session) => Observable<any>>();

  beforeAll = (describe: (session: Session) => Observable<any>) => {
    beforeAlls.push(describe);
  };

  rule = (
    ruleName: string | undefined,
    describe: (session: Session) => Observable<any>
  ) => {
    if (ruleName) {
      Logger.info(name, ruleName);
    }

    rules.push(describe);
  };

  for (const plugin of describe()) {
    plugin(builder);
  }

  return (session: Session) =>
    combineLatest(beforeAlls.map(it => it(session))).pipe(
      take(1),
      switchMap(() => forkJoin(rules.map(it => it(session)))),
      finalize(() => session.dispose())
    );
}
