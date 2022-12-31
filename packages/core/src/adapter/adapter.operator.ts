import { AdapterAggregate } from '@lib/adapter';
import { useProvider } from '@lib/shared';

export function useAdapter(adapterName: string) {
  const aggregate = useProvider<AdapterAggregate>(AdapterAggregate);

  return aggregate.get(adapterName);
}
