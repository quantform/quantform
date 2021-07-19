import { UniswapAwakeHandler } from './handlers/uniswap-awake.handler';
import { UniswapSubscribeHandler } from './handlers/uniswap-subscribe.handler';
import { UniswapAccountHandler } from './handlers/uniswap-account.handler';
import {
  AdapterAccountRequest,
  AdapterAwakeRequest,
  AdapterSubscribeRequest,
  InstrumentSelector,
  Timeframe,
  Adapter,
  PaperAdapter,
  PaperSpotModel
} from '@quantform/core';

export class UniswapAdapter extends Adapter {
  readonly name = 'uniswap';

  constructor(options?: { key: string; secret: string }) {
    super();

    this.register(AdapterAwakeRequest, new UniswapAwakeHandler(this));
    this.register(AdapterAccountRequest, new UniswapAccountHandler(this));
    this.register(AdapterSubscribeRequest, new UniswapSubscribeHandler(this));
  }

  createPaperModel(adapter: PaperAdapter) {
    return new PaperSpotModel(adapter);
  }

  translateInstrument(instrument: InstrumentSelector): string {
    return `${instrument.base.name.toUpperCase()}${instrument.quote.name.toUpperCase()}`;
  }

  translateTimeframe(timeframe: number): string {
    switch (timeframe) {
      case Timeframe.M1:
        return '1m';
      case Timeframe.M5:
        return '5m';
      case Timeframe.M15:
        return '15m';
      case Timeframe.M30:
        return '30m';
      case Timeframe.H1:
        return '1h';
      case Timeframe.H6:
        return 'h6';
      case Timeframe.H12:
        return '12h';
      case Timeframe.D1:
        return '1d';
    }

    throw new Error(`unsupported timeframe: ${timeframe}`);
  }
}
