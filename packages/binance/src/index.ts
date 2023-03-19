import { Dependency } from '@quantform/core';

import { useBalance, useBalances } from './balance';
import { useCommission } from './commission';
import { useInstrument, useInstruments } from './instrument';
import { useOrders, useOrderSubmit } from './order';
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

Binance.useBalance = useBalance;
Binance.useBalances = useBalances;
Binance.useCommission = useCommission;
Binance.useInstrument = useInstrument;
Binance.useInstruments = useInstruments;
Binance.useOrderSubmit = useOrderSubmit;
Binance.useOrders = useOrders;
Binance.useTrade = useTrade;
Binance.useOrderbookDepth = useOrderbookDepth;
Binance.useOrderbookTicker = useOrderbookTicker;
Binance.useOptions = useOptions;
