import 'reflect-metadata';

import { AsyncLocalStorage } from 'node:async_hooks';
import {
  container,
  DependencyContainer,
  inject,
  injectable,
  injectAll,
  InjectionToken,
  Lifecycle
} from 'tsyringe';

export const provider = injectable;
export const provide = inject;
export const provideAll = injectAll;

export type Dependency = {
  provide: InjectionToken;
  useClass?: any;
  useValue?: any;
};

function noModuleError() {
  return new Error('Please do not use dependency injection outside of hooks context.');
}

function withModuleError() {
  return new Error('Please do not use with hooks in context.');
}

function notInitializedModuleError() {
  return new Error('You need to initialize a module before use.');
}

function missingInjectionTokenError(token: InjectionToken) {
  return new Error(`Unable to resolve unregistered dependency: ${token.toString()}`);
}

/**
 *
 */
let moduleLocalStorage = new AsyncLocalStorage<Module>();

export function setAsyncLocalStorage(als: AsyncLocalStorage<Module>) {
  moduleLocalStorage = als;
}

/**
 * Hook to get access to current execution module dependencies.
 */
export const useContext = <T>(token: InjectionToken<T>) => {
  const module = moduleLocalStorage.getStore();

  if (!module) {
    throw noModuleError();
  }

  return module.get<T>(token);
};

/**
 * Hook to get access to current execution module dependencies.
 */
export const throwWithContext = () => {
  if (moduleLocalStorage.getStore()) {
    throw withModuleError();
  }
};

/**
 * A module is a collection of services, values, and factories that can be
 * registered with a dependency container.
 */
export class Module {
  private container?: DependencyContainer;

  constructor(private readonly dependencies: Dependency[]) {}

  /**
   * Builds and initializes dependencies.
   */
  async awake(): Promise<{ act: <T>(func: () => T) => T }> {
    this.container = this.buildContainer();

    return {
      /**
       * Associate callback function with current executing module
       */
      act: <T>(func: () => T) => moduleLocalStorage.run(this, func)
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

    this.dependencies.forEach(it => {
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
