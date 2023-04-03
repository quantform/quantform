import { Dependency } from '@quantform/core';

import { useAsset, useAssets } from './asset';
import { useBalance, useBalances } from './balance';
import { useCommission } from './commission';
import { useInstrument, useInstruments } from './instrument';
import { orderNotFound, useOrder, useOrderCancelRequest, useOrders } from './order';
import { useOrderOpenRequest } from './order/use-order-open-request';
import { useOrderbookDepth, useOrderbookTicker } from './orderbook';
import { useTrade } from './trade';
import { BinanceOptions, useOptions } from './use-options';

export function Binance(options: Partial<BinanceOptions>): Dependency[] {
  return [
    {
      provide: BinanceOptions,
      useValue: { ...new BinanceOptions(), ...options }
    }
  ];
}

Binance.useAsset = useAsset;
Binance.useAssets = useAssets;
Binance.useBalance = useBalance;
Binance.useBalances = useBalances;
Binance.useCommission = useCommission;
Binance.useInstrument = useInstrument;
Binance.useInstruments = useInstruments;
Binance.useOrder = useOrder;
Binance.useOrders = useOrders;
Binance.useOrderCancel = useOrderCancelRequest;
Binance.useOrderOpen = useOrderOpenRequest;
Binance.useTrade = useTrade;
Binance.useOrderbookDepth = useOrderbookDepth;
Binance.useOrderbookTicker = useOrderbookTicker;
Binance.useOptions = useOptions;

export { orderNotFound };
