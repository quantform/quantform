import { Adapter } from '@lib/adapter';
import { provideAll, provider } from '@lib/module';

export const AdapterInjectionToken = Symbol('adapter-injection-token');

@provider()
export class AdapterFactory {
  constructor(
    @provideAll(AdapterInjectionToken) protected readonly adapters: Adapter[]
  ) {}

  get() {
    return this.adapters;
  }
}
