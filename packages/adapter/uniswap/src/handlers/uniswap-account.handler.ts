import {
  AdapterAccountRequest,
  AdapterContext,
  AdapterHandler,
  Store
} from '@quantform/core';
import { UniswapAdapter } from '../uniswap-adapter';

export class UniswapAccountHandler
  implements AdapterHandler<AdapterAccountRequest, void> {

  constructor(private readonly adapter: UniswapAdapter) {}

  async handle(
    request: AdapterAccountRequest,
    store: Store,
    context: AdapterContext
  ): Promise<void> {
  }

}
