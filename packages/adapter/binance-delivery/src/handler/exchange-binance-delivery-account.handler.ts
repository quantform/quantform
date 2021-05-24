import { AdapterAccountRequest, AdapterHandler, Logger } from '@quantform/core';

export class ExchangeBinanceDeliveryAccountHandler
  implements AdapterHandler<AdapterAccountRequest, void> {
  async handle(): Promise<void> {
    Logger.log('empty');
  }
}
