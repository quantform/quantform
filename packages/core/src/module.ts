import 'reflect-metadata';

import {
  container,
  DependencyContainer,
  inject,
  injectable,
  InjectionToken
} from 'tsyringe';

import { log } from '@lib/shared';

export const provider = injectable;
export const provide = inject;

/**
 * Hook to get access to current execution module dependencies.
 */
export let useModule: () => {
  get<T>(token: InjectionToken<T>): T;
  getAll<T>(token: InjectionToken<T>): T[];
};

export type ModuleDefinition = {
  dependencies: Array<{
    provide: InjectionToken;
    useClass?: any;
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
  async awake(): Promise<void> {
    this.container = this.buildContainer();
  }

  /**
   * Disposes all dependencies instantiated by this module.
   * @returns
   */
  dispose() {
    if (!this.container) {
      return;
    }

    this.container.dispose();
    this.container = undefined;
  }

  executeUsingModule<T>(func: () => T) {
    useModule = () => this;

    const result = func();

    useModule = () => {
      throw noModuleError();
    };

    return result;
  }

  /**
   * Builds a new instance of dependency container based on module definition.
   * @returns
   */
  protected buildContainer(): DependencyContainer {
    const childContainer = container.createChildContainer();
    const { dependencies } = this.definition;

    dependencies.forEach(it =>
      childContainer.registerSingleton(it.provide, it.useClass ?? it.provide)
    );

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