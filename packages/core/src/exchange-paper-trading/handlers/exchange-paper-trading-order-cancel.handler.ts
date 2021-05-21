import { ExchangeAdapterHandler } from '../../exchange-adapter';
import { ExchangeOrderCancelRequest } from '../../exchange-adapter/exchange-adapter-request';
import { ExchangePaperTradingAdapter } from '../exchange-paper-trading-adapter';

export class ExchangePaperTradingOrderCancelHandler
  implements ExchangeAdapterHandler<ExchangeOrderCancelRequest, void> {
  constructor(private readonly adapter: ExchangePaperTradingAdapter) {}

  async handle(request: ExchangeOrderCancelRequest): Promise<void> {
    this.adapter.platform.cancel(request.order);
  }
}
