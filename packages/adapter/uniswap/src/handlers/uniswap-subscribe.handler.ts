import {
  AdapterContext,
  AdapterHandler,
  AdapterSubscribeRequest,
  Store} from '@quantform/core';
import { UniswapAdapter } from '../uniswap-adapter';

export class UniswapSubscribeHandler
  implements AdapterHandler<AdapterSubscribeRequest, void> {
  constructor(private readonly adapter: UniswapAdapter) {}

  async handle(
    request: AdapterSubscribeRequest,
    store: Store,
    context: AdapterContext
  ): Promise<void> {
  }
}
