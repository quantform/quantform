import { ExchangeAdapterRequest } from './exchange-adapter-request';
import { ExchangeAdapterContext } from './exchange-adapter-context';
import { ExchangeAdapterHandler } from './exchange-adapter-handler';
import { timestamp, Type } from '../common';
import { ExchangeAdapterType } from './exchange-adapter-type';
import { Store } from '../store';

export abstract class ExchangeAdapter implements ExchangeAdapterContext {
  private handlers: Record<string, ExchangeAdapterHandler<any, any>> = {};

  abstract name: string;
  abstract type: ExchangeAdapterType;
  abstract timestamp(): timestamp;

  register<TRequest extends ExchangeAdapterRequest<TResponse>, TResponse>(
    requestType: Type<TRequest>,
    handler: ExchangeAdapterHandler<TRequest, TResponse>
  ) {
    this.handlers[requestType.name] = handler;
  }

  execute<TRequest extends ExchangeAdapterRequest<TResponse>, TResponse>(
    request: TRequest,
    store: Store,
    context: ExchangeAdapterContext
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

export abstract class ExchangeSpotAdapter extends ExchangeAdapter {
  public type: ExchangeAdapterType = 'SPOT';
}

export abstract class ExchangeMarginAdapter extends ExchangeAdapter {
  public type: ExchangeAdapterType = 'MARGIN';
}

export abstract class ExchangeDeliveryAdapter extends ExchangeAdapter {
  public type: ExchangeAdapterType = 'DELIVERY';
}
