import { AdapterAggregate } from '@lib/adapter';
import { useModule } from '@lib/module';

export function useAdapter(adapterName: string) {
  const aggregate = useModule().get(AdapterAggregate);

  return aggregate.get(adapterName);
}
