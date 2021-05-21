import { Logger } from '../../common';
import { ExchangeAdapterHandler } from '../../exchange-adapter';
import { ExchangeAccountRequest } from '../../exchange-adapter/exchange-adapter-request';

export class ExchangeBinanceDeliveryAccountHandler
  implements ExchangeAdapterHandler<ExchangeAccountRequest, void> {
  async handle(): Promise<void> {
    Logger.log('empty');
  }
}
