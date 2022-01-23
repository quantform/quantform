import { OandaSubscribeHandler } from './handlers/oanda-subscribe.handler';
import { Set } from 'typescript-collections';
import { OandaAccountHandler } from './handlers/oanda-account.handler';
import { OandaAwakeHandler } from './handlers/oanda-awake.handler';
import Oanda = require('@oanda/v20/context');
import {
  AssetSelector,
  Instrument,
  PaperAdapter,
  Adapter,
  PaperMarginSimulator,
  AdapterContext,
  InstrumentSelector
} from '@quantform/core';

export class OandaAdapter extends Adapter {
  readonly name = 'oanda';
  readonly http = new Oanda.Context('api-fxpractice.oanda.com', 443, true, 'test');
  readonly socket = new Oanda.Context('stream-fxpractice.oanda.com', 443, true, 'test');
  readonly accountId: string;

  subscription = new Set<Instrument>();
  asset = new AssetSelector('eur', this.name);

  constructor(options?: { accountId: string }) {
    super();

    this.accountId = options?.accountId ?? process.env.QF_OANDA_ACCOUNTID;

    this.http.setToken(process.env.QF_OANDA_TOKEN);
    this.socket.setToken(process.env.QF_OANDA_TOKEN);
  }

  createPaperSimulator(adapter: PaperAdapter) {
    return new PaperMarginSimulator(adapter);
  }

  async awake(context: AdapterContext): Promise<void> {
    await super.awake(context);
    return OandaAwakeHandler(context, this);
  }

  account(): Promise<void> {
    return OandaAccountHandler(this.context, this);
  }

  subscribe(instruments: InstrumentSelector[]): Promise<void> {
    return OandaSubscribeHandler(instruments, this.context, this);
  }
}
