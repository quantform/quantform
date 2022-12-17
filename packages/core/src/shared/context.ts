import 'reflect-metadata';

import { Constructable, Container, Service } from 'typedi';
export const Injectable = Service;

export function useContext<T>(type: Constructable<T>): T {
  return Container.get(type);
}
