import { Store } from '../store';
import { AdapterContext } from './adapter-context';
import { AdapterRequest } from './adapter-request';

export interface AdapterHandler<TRequest extends AdapterRequest<TResponse>, TResponse> {
  handle(request: TRequest, store: Store, context: AdapterContext): Promise<TResponse>;
}
