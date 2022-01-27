import {
  Adapter,
  AdapterContext,
  InstrumentSelector,
  PaperAdapter,
  PaperMarginSimulator
} from '@quantform/core';
import * as FactoryAbi from './abi/uniswap-V2-factory-abi.json';
import { UniswapAccountHandler } from './handlers/uniswap-account.handler';
import { UniswapAwakeHandler } from './handlers/uniswap-awake.handler';
import { UniswapSubscribeHandler } from './handlers/uniswap-subscribe.handler';
const Web3 = require('web3');

export class UniswapAdapter extends Adapter {
  readonly name = 'uniswap';
  readonly factoryAddress = '0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852';

  readonly web3: any;
  readonly provider: any;

  constructor(options?: { host: string }) {
    super();

    this.provider = new Web3.providers.WebsocketProvider(
      options ? options.host : process.env.QF_UNISWAP_PROVIDER
    );

    this.provider.on('connect', message => {
      console.log('connected');
    });

    this.provider.on('error', message => {
      console.log('error', this.provider);
    });

    this.provider.on('end', message => {
      console.log('end', this.provider);
    });

    this.web3 = new Web3(this.provider);

    const uniswapV2FactoryContract = new this.web3.eth.Contract(
      FactoryAbi,
      this.factoryAddress
    ).events
      .Swap({})
      .on('data', async function (event: any) {
        console.log(event);
      });
  }

  createPaperSimulator(adapter: PaperAdapter) {
    return new PaperMarginSimulator(adapter);
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
