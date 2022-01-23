import { UniswapAwakeHandler } from './handlers/uniswap-awake.handler';
import { UniswapSubscribeHandler } from './handlers/uniswap-subscribe.handler';
import { UniswapAccountHandler } from './handlers/uniswap-account.handler';
import {
  Adapter,
  PaperAdapter,
  PaperSpotExecutor,
  AdapterContext,
  InstrumentSelector
} from '@quantform/core';

export class UniswapAdapter extends Adapter {
  readonly name = 'uniswap';

  createPaperExecutor(adapter: PaperAdapter) {
    return new PaperSpotExecutor(adapter);
  }

  async awake(context: AdapterContext): Promise<void> {
    super.awake(context);
    await UniswapAwakeHandler(context);
  }

  async account(): Promise<void> {
    UniswapAccountHandler(this.context);
  }

  async subscribe(instruments: InstrumentSelector[]): Promise<void> {
    UniswapSubscribeHandler(this.context);
  }
}
