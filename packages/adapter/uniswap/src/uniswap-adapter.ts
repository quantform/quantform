import { UniswapAwakeHandler } from './handlers/uniswap-awake.handler';
import { UniswapSubscribeHandler } from './handlers/uniswap-subscribe.handler';
import { UniswapAccountHandler } from './handlers/uniswap-account.handler';
import {
  Adapter,
  PaperAdapter,
  PaperSpotExecutor,
  AdapterAwakeCommand,
  AdapterContext,
  handler,
  AdapterAccountCommand,
  AdapterSubscribeCommand
} from '@quantform/core';

export class UniswapAdapter extends Adapter {
  readonly name = 'uniswap';

  createPaperExecutor(adapter: PaperAdapter) {
    return new PaperSpotExecutor(adapter);
  }

  @handler(AdapterAwakeCommand)
  onAwake(command: AdapterAwakeCommand, context: AdapterContext) {
    return UniswapAwakeHandler(command, context);
  }

  @handler(AdapterAccountCommand)
  onAccount(command: AdapterAccountCommand, context: AdapterContext) {
    return UniswapAccountHandler(command, context);
  }

  @handler(AdapterSubscribeCommand)
  onSubscribe(command: AdapterSubscribeCommand, context: AdapterContext) {
    return UniswapSubscribeHandler(command, context);
  }
}
