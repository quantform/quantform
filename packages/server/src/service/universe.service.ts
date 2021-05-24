import { ExchangeAdapterAggregate, Store } from '@quantform/core';
import { Service } from 'typedi';
import { SessionDescriptorRegistry } from './session-descriptor-registry';

@Service()
export class UniverseService {
  constructor(private readonly registry: SessionDescriptorRegistry) {}

  async list(id: string): Promise<string[]> {
    const descriptor = this.registry.resolve(id);
    const store = new Store();

    const aggregate = new ExchangeAdapterAggregate(store, descriptor.adapter());
    await aggregate.initialize();

    const instruments = Object.keys(store.snapshot.universe.instrument);

    await aggregate.dispose();

    return instruments.sort();
  }
}
