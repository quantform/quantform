import chalk from 'chalk';
import { finalize, forkJoin, Observable, of, switchMap } from 'rxjs';

import { Session, SessionBuilder, SessionFeature } from '@lib/component';
export * from '@lib/adapter';
export * from '@lib/component';
export * from '@lib/shared';
export * from '@lib/storage';
export * from '@lib/store';

import { log } from '@lib/shared';

const registry: Record<string, () => Array<SessionFeature>> = {};

export type SessionHook = (session: Session) => Observable<any>;

/**
 * Describes a single strategy logic
 */
export let rule: (name: string | undefined, describe: SessionHook) => void;

/**
 *
 */
export let awake: (describe: SessionHook) => void;

/**
 *
 * @param name
 * @param describe
 */
export function strategy(name: string, describe: () => Array<SessionFeature>) {
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

  const logger = log(name);
  const ruleHooks = new Array<SessionHook>();
  const awakeHooks = new Array<SessionHook>();

  awake = (describe: SessionHook) => {
    awakeHooks.push(describe);
  };

  rule = (ruleName: string | undefined, describe: SessionHook) => {
    if (ruleName) {
      logger.info(`${chalk.italic(ruleName)} rule found`);
    }

    ruleHooks.push(describe);
  };

  for (const feature of describe()) {
    feature(builder);
  }

  return (session: Session) => {
    const beforeAll$ = awakeHooks.map(it => it(session));
    const rule$ = ruleHooks.map(it => it(session));

    if (!beforeAll$.length) {
      beforeAll$.push(of(true));
    }

    return forkJoin(beforeAll$).pipe(
      switchMap(() => forkJoin(rule$)),
      finalize(() => session.dispose())
    );
  };
}
