import { forkJoin, lastValueFrom, Observable, of, switchMap } from 'rxjs';

import { Module, ModuleDefinition } from '@lib/module';
import { storage } from '@lib/storage';
import { store } from '@lib/store';
import { ExecutionModeToken, IExecutionMode } from '@lib/useFake';

export * from '@lib/adapter';
export * from '@lib/component';
export * from '@lib/shared';
export * from '@lib/storage';
export * from '@lib/module';
export * from '@lib/store-v2/dictionary-store';
export * from '@lib/useMemo';
export * from '@lib/useStore';
export * from '@lib/useTimestamp';
export * from '@lib/useFake';

export type Strategy = () => ModuleDefinition;
export type StrategyHook = () => Observable<any>;

export let awake: (body: StrategyHook) => void;
export let rule: (body: StrategyHook) => void;

export function quantform(strategy: Strategy) {
  const hooks = {
    awake: new Array<StrategyHook>(),
    rule: new Array<StrategyHook>()
  };

  awake = (body: StrategyHook) => hooks.awake.push(body);
  rule = (body: StrategyHook) => hooks.rule.push(body);

  const definition = strategy();

  const module = new Module({
    dependencies: [
      ...store().dependencies,
      ...storage().dependencies,
      ...definition.dependencies
    ]
  });

  awake = () => {
    throw new Error();
  };

  rule = () => {
    throw new Error();
  };

  const hydrate = (module: Module) =>
    module.executeUsingModule(() => {
      const beforeAll$ = hooks.awake.map(it => it());
      const rule$ = hooks.rule.map(it => it());

      if (!beforeAll$.length) {
        beforeAll$.push(of(true));
      }

      return lastValueFrom(forkJoin(beforeAll$).pipe(switchMap(() => forkJoin(rule$))));
    });

  return { module, hydrate };
}

class ExecMode implements IExecutionMode {
  isReal(): boolean {
    return true;
  }
}

export function core(): ModuleDefinition {
  return {
    dependencies: [{ provide: ExecutionModeToken, useClass: ExecMode }]
  };
}
