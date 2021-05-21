import { ExchangeAdapterHandler } from '../../exchange-adapter';
import { ExchangeOrderOpenRequest } from '../../exchange-adapter/exchange-adapter-request';
import { ExchangePaperTradingAdapter } from '../exchange-paper-trading-adapter';

export class ExchangePaperTradingOrderOpenHandler
  implements ExchangeAdapterHandler<ExchangeOrderOpenRequest, void> {
  constructor(private readonly adapter: ExchangePaperTradingAdapter) {}

  async handle(request: ExchangeOrderOpenRequest): Promise<void> {
    this.adapter.platform.open(request.order);
  }
}
