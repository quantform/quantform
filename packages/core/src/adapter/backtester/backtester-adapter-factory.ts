import { Adapter, BacktesterAdapter, BacktesterStreamer } from '@lib/adapter';
import { AdapterFactory, AdapterInjectionToken } from '@lib/adapter/adapter-factory';
import { provideAll, provider } from '@lib/module';
import { Store } from '@lib/store';

@provider()
export class BacktesterAdapterFactory extends AdapterFactory {
  constructor(
    @provideAll(AdapterInjectionToken) protected readonly adapters: Adapter[],
    private readonly streamer: BacktesterStreamer,
    private readonly store: Store
  ) {
    super(adapters);
  }

  get(): Adapter[] {
    return this.adapters.map(it => new BacktesterAdapter(it, this.streamer, this.store));
  }
}
