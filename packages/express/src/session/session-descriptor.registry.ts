import { SessionDescriptor } from '@quantform/core';
import { Service } from 'typedi';

@Service()
export class SessionDescriptorRegistry {
  private readonly registry: Record<string, SessionDescriptor> = {};

  register(descriptor: SessionDescriptor) {
    this.registry[descriptor['name']] = descriptor;
  }

  resolve(name: string): SessionDescriptor {
    return this.registry[name];
  }

  list(): Record<string, SessionDescriptor> {
    return this.registry;
  }
}
