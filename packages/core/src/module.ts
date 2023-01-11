import 'reflect-metadata';

import {
  container,
  DependencyContainer,
  inject,
  injectable,
  injectAll,
  InjectionToken,
  Lifecycle
} from 'tsyringe';

import { log } from '@lib/shared';

export const provider = injectable;
export const provide = inject;
export const provideAll = injectAll;

/**
 * Hook to get access to current execution module dependencies.
 */
export let useModule: () => {
  get<T>(token: InjectionToken<T>): T;
  getAll<T>(token: InjectionToken<T>): T[];
};

export const useProvider = <T>(token: InjectionToken<T>) => useModule().get<T>(token);

export type ModuleDefinition = {
  dependencies: Array<{
    provide: InjectionToken;
    useClass?: any;
    useValue?: any;
  }>;
};

function noModuleError() {
  return new Error('Please do not use dependency injection outside of hooks context.');
}

function notInitializedModuleError() {
  return new Error('You need to initialize a module before use.');
}

function missingInjectionTokenError(token: InjectionToken) {
  return new Error(`Unable to resolve unregistered dependency: ${token.toString()}`);
}

/**
 * A module is a collection of services, values, and factories that can be
 * registered with a dependency container.
 */
export class Module {
  private readonly logger = log(Module.name);
  private container?: DependencyContainer;

  constructor(private readonly definition: ModuleDefinition) {}

  /**
   * Builds and initializes dependencies.
   */
  async awake(): Promise<{ act: <T>(func: () => Promise<T>) => Promise<T> }> {
    this.container = this.buildContainer();

    return {
      act: async <T>(func: () => Promise<T>) => {
        useModule = () => this;

        const result = await func();

        useModule = () => {
          throw noModuleError();
        };

        return result;
      }
    };
  }

  /**
   * Disposes all dependencies instantiated by this module.
   * @returns
   */
  dispose() {
    if (!this.container) {
      return;
    }

    this.container = undefined;
  }

  /**
   * Builds a new instance of dependency container based on module definition.
   * @returns
   */
  protected buildContainer(): DependencyContainer {
    const childContainer = container.createChildContainer();
    const { dependencies } = this.definition;

    dependencies.forEach(it => {
      if (it.useValue) {
        childContainer.register(it.provide, { useValue: it.useValue });
      } else {
        childContainer.register(it.provide, it.useClass ?? it.provide, {
          lifecycle: Lifecycle.Singleton
        });
      }
    });

    return childContainer;
  }

  /**
   * Resolves a dependency from the module.
   * @param token represents the identifier for the dependency that you want to
   * resolve from the container.
   * @returns instance of the dependency.
   */
  get<T>(token: InjectionToken<T>): T {
    if (!this.container) {
      throw notInitializedModuleError();
    }

    if (!this.container.isRegistered(token)) {
      throw missingInjectionTokenError(token);
    }

    return this.container.resolve<T>(token);
  }

  /**
   * Resolves a collection of dependencies from the module.
   * @param token
   * @returns
   */
  getAll<T>(token: InjectionToken<T>): T[] {
    if (!this.container) {
      throw notInitializedModuleError();
    }

    if (!this.container.isRegistered(token)) {
      throw missingInjectionTokenError(token);
    }

    return container.resolveAll<T>(token);
  }
}
