import { Module, ModuleDefinition, provider } from '@lib/module';

describe(Module.name, () => {
  let fixtures: ReturnType<typeof getFixtures>;

  beforeEach(() => {
    fixtures = getFixtures();
  });

  test('builds empty module', async () => {
    const module = fixtures.givenModuleCreated({ dependencies: [] });
    fixtures.whenModuleBuilt(module);
  });

  test('builds module and resolves single dependency', async () => {
    const definition = fixtures.definitions.single;
    const module = fixtures.givenModuleCreated(definition);
    fixtures.whenModuleBuilt(module);
    fixtures.thenCanResolveDependencies(module, definition);
  });

  test('builds module and resolves many dependencies', async () => {
    const definition = fixtures.definitions.many;
    const module = fixtures.givenModuleCreated(definition);
    fixtures.whenModuleBuilt(module);
    fixtures.thenCanResolveDependencies(module, definition);
  });
});

function getFixtures() {
  return {
    definitions: {
      single: {
        dependencies: [
          {
            provide: FakeService,
            useClass: FakeService
          }
        ]
      } as ModuleDefinition,
      many: {
        dependencies: [
          {
            provide: FakeService,
            useClass: FakeService
          },
          {
            provide: FakeService,
            useClass: FakeService
          }
        ]
      } as ModuleDefinition
    },
    givenModuleCreated: (definition: ModuleDefinition) => new Module(definition),
    whenModuleBuilt: (module: Module) => module.awake(),
    thenCanResolveDependencies: (module: Module, definition: ModuleDefinition) => {
      definition.dependencies.forEach(it => {
        expect(module.get(it.provide)).toBeTruthy();
      });
    }
  };
}

@provider()
class FakeService {}
