import { AdapterRequest } from './adapter-request';
import { AdapterContext } from './adapter-context';
import { AdapterHandler } from './adapter-handler';
import { timestamp, Type } from '../common';
import { ExchangeAdapterType } from './adapter-type';
import { Store } from '../store';

export abstract class Adapter implements AdapterContext {
  private handlers: Record<string, AdapterHandler<any, any>> = {};

  abstract name: string;
  abstract type: ExchangeAdapterType;
  abstract timestamp(): timestamp;
  abstract readonly(): boolean;

  register<TRequest extends AdapterRequest<TResponse>, TResponse>(
    requestType: Type<TRequest>,
    handler: AdapterHandler<TRequest, TResponse>
  ) {
    this.handlers[requestType.name] = handler;
  }

  execute<TRequest extends AdapterRequest<TResponse>, TResponse>(
    request: TRequest,
    store: Store,
    context: AdapterContext
  ): Promise<TResponse> {
    const handler = this.handlers[request.typeName];
    if (!handler) {
      throw new Error(
        `handler not defined for ${request.typeName} in ${this.name} adapter.`
      );
    }

    return handler.handle(request, store, context);
  }
}

export abstract class SpotAdapter extends Adapter {
  public type: ExchangeAdapterType = 'SPOT';
}

export abstract class MarginAdapter extends Adapter {
  public type: ExchangeAdapterType = 'MARGIN';
}

export abstract class DeliveryAdapter extends Adapter {
  public type: ExchangeAdapterType = 'DELIVERY';
}
