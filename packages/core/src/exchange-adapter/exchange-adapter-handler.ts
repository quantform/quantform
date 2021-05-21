import { Store } from '../store';
import { ExchangeAdapterContext } from './exchange-adapter-context';
import { ExchangeAdapterRequest } from './exchange-adapter-request';

export interface ExchangeAdapterHandler<
  TRequest extends ExchangeAdapterRequest<TResponse>,
  TResponse
> {
  handle(
    request: TRequest,
    store: Store,
    context: ExchangeAdapterContext
  ): Promise<TResponse>;
}
