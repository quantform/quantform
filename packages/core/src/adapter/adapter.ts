import { AdapterRequest } from './adapter-request';
import { AdapterContext } from './adapter-context';
import { AdapterHandler } from './adapter-handler';
import { now, timestamp, Type } from '../common';
import { Store } from '../store';
import { PaperModel } from './paper/model/paper-model';
import { PaperAdapter } from './paper';

export abstract class Adapter implements AdapterContext {
  private handlers: Record<string, AdapterHandler<any, any>> = {};

  abstract name: string;
  abstract createPaperModel(adapter: PaperAdapter): PaperModel;

  timestamp(): timestamp {
    return now();
  }

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
