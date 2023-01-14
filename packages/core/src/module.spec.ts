import { Dependency, Module, provider } from '@lib/module';

describe(Module.name, () => {
  let fixtures: ReturnType<typeof getFixtures>;

  beforeEach(() => {
    fixtures = getFixtures();
  });

  test('builds empty module', async () => {
    const module = fixtures.givenModuleCreated([]);
    fixtures.whenModuleBuilt(module);
  });

  test('builds module and resolves single value dependency', async () => {
    const definition = fixtures.definitions.singleValue;
    const module = fixtures.givenModuleCreated(definition);
    fixtures.whenModuleBuilt(module);
    fixtures.thenCanResolveDependencies(module, definition);
  });

  test('builds module and resolves single class dependency', async () => {
    const definition = fixtures.definitions.singleClass;
    const module = fixtures.givenModuleCreated(definition);
    fixtures.whenModuleBuilt(module);
    fixtures.thenCanResolveDependencies(module, definition);
  });

  test('builds module and resolves many class dependencies', async () => {
    const definition = fixtures.definitions.manyClass;
    const module = fixtures.givenModuleCreated(definition);
    fixtures.whenModuleBuilt(module);
    fixtures.thenCanResolveDependencies(module, definition);
  });
});

function getFixtures() {
  return {
    definitions: {
      singleClass: [
        {
          provide: FakeService,
          useClass: FakeService
        }
      ],
      manyClass: [
        {
          provide: FakeService,
          useClass: FakeService
        },
        {
          provide: FakeService,
          useClass: FakeService
        }
      ],
      singleValue: [
        {
          provide: FakeService,
          useValue: new FakeService()
        }
      ]
    },
    givenModuleCreated: (dependencies: Dependency[]) => new Module(dependencies),
    whenModuleBuilt: (module: Module) => module.awake(),
    thenCanResolveDependencies: (module: Module, dependencies: Dependency[]) => {
      dependencies.forEach(it => {
        expect(module.get<FakeService>(it.provide)).toBeTruthy();
      });
    }
  };
}

@provider()
class FakeService {}
