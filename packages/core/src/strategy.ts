import { finalize, forkJoin, Observable, switchMap } from 'rxjs';

import { Session, SessionBuilder, SessionFeature } from './domain';
import { Logger } from './shared';

const registry: Record<string, () => Array<SessionFeature>> = {};

export type SessionAction = (session: Session) => Observable<any>;

export let rule: (name: string | undefined, describe: SessionAction) => void;
export let beforeAll: (describe: SessionAction) => void;

export function describe(name: string, describe: () => Array<SessionFeature>) {
  registry[name] = describe;
}

export async function prepare(name: string, builder: SessionBuilder) {
  const describe = registry[name];
  const rules = new Array<SessionAction>();
  const beforeAlls = new Array<SessionAction>();

  beforeAll = (describe: SessionAction) => {
    beforeAlls.push(describe);
  };

  rule = (ruleName: string | undefined, describe: SessionAction) => {
    if (ruleName) {
      Logger.info(name, ruleName);
    }

    rules.push(describe);
  };

  for (const plugin of describe()) {
    plugin(builder);
  }

  return (session: Session) => {
    const toBeforeAll = beforeAlls.map(it => it(session));
    const toRules = rules.map(it => it(session));

    return forkJoin(toBeforeAll).pipe(
      switchMap(() => forkJoin(toRules)),
      finalize(() => session.dispose())
    );
  };
}
