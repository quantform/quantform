import { AdapterAggregate } from '@lib/adapter';
import { useContext } from '@lib/shared';

export function useAdapter(adapterName: string) {
  const aggregate = useContext(AdapterAggregate);

  return aggregate.get(adapterName);
}
