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

export type ModuleDefinition = {
  providers: Array<{
    provide: InjectionToken;
    useClass?: any;
  }>;
};

function moduleNotBuiltError() {
  return new Error('module not built');
}

/**
 *
 */
export class Module {
  protected readonly logger = log(Module.name);
  protected container?: DependencyContainer;

  constructor(private readonly definition: ModuleDefinition) {}

  async awake(): Promise<void> {
    this.container = this.buildContainer();
  }

  /**
   * Builds a new instance of dependency container based on module definition.
   * @returns
   */
  protected buildContainer(): DependencyContainer {
    const childContainer = container.createChildContainer();
    const { providers } = this.definition;

    providers.forEach(it =>
      childContainer.registerSingleton(it.provide, it.useClass ?? it.provide)
    );

    return childContainer;
  }

  /**
   * Instantiate and return the dependency for specific token.
   * @param token
   * @returns
   */
  get<T>(token: InjectionToken<T>): T {
    if (!this.container) {
      throw moduleNotBuiltError();
    }

    if (!this.container.isRegistered(token)) {
      throw new Error(`Unable to provide unregistered dependency: ${token.toString()}`);
    }

    return this.container.resolve<T>(token);
  }

  /**
   * Instantiate and return a collection of dependencies for same token.
   * @param token
   * @returns
   */
  getAll<T>(token: InjectionToken<T>): T[] {
    if (!this.container) {
      throw moduleNotBuiltError();
    }

    return container.resolveAll<T>(token);
  }
}
