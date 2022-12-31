import { forkJoin, lastValueFrom, Observable, of, switchMap } from 'rxjs';

import { Module, ModuleDefinition } from '@lib/module';

export type Strategy = () => ModuleDefinition;
export type StrategyHook = () => Observable<any>;

export let awake: (body: StrategyHook) => void;
export let rule: (body: StrategyHook) => void;
export let useModule: () => Module;

function noModuleError() {
  return new Error('no module');
}

export async function quantform(strategy: Strategy): Promise<void> {
  const hooks = {
    awake: new Array<StrategyHook>(),
    rule: new Array<StrategyHook>()
  };

  awake = (body: StrategyHook) => hooks.awake.push(body);
  rule = (body: StrategyHook) => hooks.rule.push(body);

  const module = new Module(strategy());

  await module.awake();

  useModule = () => module;

  const beforeAll$ = hooks.awake.map(it => it());
  const rule$ = hooks.rule.map(it => it());

  useModule = () => {
    throw noModuleError();
  };

  if (!beforeAll$.length) {
    beforeAll$.push(of(true));
  }

  await lastValueFrom(forkJoin(beforeAll$).pipe(switchMap(() => forkJoin(rule$))));
}
