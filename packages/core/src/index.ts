import chalk from 'chalk';
import { finalize, forkJoin, Observable, switchMap } from 'rxjs';

import { Session, SessionBuilder, SessionFeature } from './domain';
export * from './adapter';
export * from './domain';
export * from './shared';
export * from './storage';
export * from './store';

import { Logger } from './shared';

const registry: Record<string, () => Array<SessionFeature>> = {};

export type SessionHook = (session: Session) => Observable<any>;

/**
 * Describes a single strategy logic
 */
export let rule: (name: string | undefined, describe: SessionHook) => void;

/**
 *
 */
export let beforeAll: (describe: SessionHook) => void;

/**
 *
 * @param name
 * @param describe
 */
export function describe(name: string, describe: () => Array<SessionFeature>) {
  registry[name] = describe;
}

/**
 *
 * @param name
 * @param builder
 * @returns
 */
export async function spawn(name: string, builder: SessionBuilder) {
  const describe = registry[name];
  if (!describe) {
    throw new Error(`missing strategy: ${name}`);
  }

  const ruleHooks = new Array<SessionHook>();
  const beforeAllHooks = new Array<SessionHook>();

  beforeAll = (describe: SessionHook) => {
    beforeAllHooks.push(describe);
  };

  rule = (ruleName: string | undefined, describe: SessionHook) => {
    if (ruleName) {
      Logger.info(name, `${chalk.italic(ruleName)} rule found`);
    }

    ruleHooks.push(describe);
  };

  for (const feature of describe()) {
    feature(builder);
  }

  return (session: Session) => {
    const beforeAll$ = beforeAllHooks.map(it => it(session));
    const rule$ = ruleHooks.map(it => it(session));

    return forkJoin(beforeAll$).pipe(
      switchMap(() => forkJoin(rule$)),
      finalize(() => session.dispose())
    );
  };
}
