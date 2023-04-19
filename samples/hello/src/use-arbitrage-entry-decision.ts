import { d, InferObservableType, provider, useContext } from '@quantform/core';

import { useOrderbookCross } from './use-orderbook-cross';

//@provider()
export class ArbitrageEntryDecision {
  decide(
    cross: InferObservableType<ReturnType<typeof useOrderbookCross>>
  ): 'TRADE' | 'IDLE' {
    return 'IDLE';
  }
}

export function arbitrageEntryDecision(decision: ArbitrageEntryDecision) {
  return {
    provide: ArbitrageEntryDecision,
    useValue: decision
  };
}

export function useArbitrageEntryDecision() {
  return useContext(ArbitrageEntryDecision);
}

export class AnyDecision implements ArbitrageEntryDecision {
  decide(
    cross: InferObservableType<ReturnType<typeof useOrderbookCross>>
  ): 'TRADE' | 'IDLE' {
    if (!cross) {
      return 'IDLE';
    }

    const quantity = d(1);

    const x = cross.x.instrument.base.floor(quantity.div(cross.x.rate));
    const y = cross.y.instrument.quote.floor(x.mul(cross.y.rate));
    const z = cross.z.instrument.base.floor(y.div(cross.z.rate));

    const pnl = z.minus(quantity);
    const pnLPercent = z.div(quantity).minus(1).mul(100);

    /*   console.log(
      `${cross.x.instrument.base}(${cross.x.rate.toFixed()}) -> ${
        cross.y.instrument.quote
      }(${cross.y.rate.toFixed()}) -> ${
        cross.z.instrument.base
      }(${cross.z.rate.toFixed()}) = ${pnl.toFixed()}(${pnLPercent.toFixed(4)}%)`
    );*/

    return 'TRADE';
  }
}
