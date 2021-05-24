import { AdapterAccountRequest, AdapterHandler, Logger } from '@quantform/core';

export class BinanceDeliveryAccountHandler
  implements AdapterHandler<AdapterAccountRequest, void> {
  async handle(): Promise<void> {
    Logger.log('empty');
  }
}
