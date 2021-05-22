import { ExchangeAccountRequest, ExchangeAdapterHandler, Logger } from '@quantform/core';

export class ExchangeBinanceDeliveryAccountHandler
  implements ExchangeAdapterHandler<ExchangeAccountRequest, void> {
  async handle(): Promise<void> {
    Logger.log('empty');
  }
}
