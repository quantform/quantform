import 'reflect-metadata';

import { Observable, of, switchMap, tap } from 'rxjs';
import { InjectionToken } from 'tsyringe';

import { quantform, rule } from '@lib/index';
import { provider, useModule } from '@lib/module';

export function useProvider<T>(token: InjectionToken<T>): T {
  return useModule().get<T>(token);
}

function ttt() {
  const service = useProvider(FakeService);

  return (ikn: Observable<any>) => ikn.pipe(switchMap(() => of(service)));
}

describe('strategy', () => {
  let fixtures: ReturnType<typeof getFixtures>;

  beforeEach(() => {
    fixtures = getFixtures();
  });

  test('builds empty module', async () => {
    const strategy = () => {
      rule(() =>
        of(1).pipe(
          ttt(),
          tap(it => {
            expect(it.value).toBe('123');
          })
        )
      );

      return {
        dependencies: [
          {
            provide: FakeService,
            useClass: FakeService
          }
        ]
      };
    };

    await quantform(strategy);
  });
});

function getFixtures() {
  return 0;
}

@provider()
class FakeService {
  value = '123';
}
