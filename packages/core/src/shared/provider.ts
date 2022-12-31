import 'reflect-metadata';

import { container, inject, injectable, InjectionToken } from 'tsyringe';

export const provider = injectable;
export const provide = inject;

export function useProvider<T>(token: InjectionToken): T {
  if (!container.isRegistered(token)) {
    throw new Error(`Unable to provide unregistered dependency: ${token.toString()}`);
  }

  return container.resolve<T>(token);
}

export function useProviders<T>(token: InjectionToken): T[] {
  return container.resolveAll<T>(token);
}
