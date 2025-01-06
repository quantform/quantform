import { provider, useContext } from '@quantform/core';

@provider()
export class HyperliquidOptions {
  rest = {
    url: 'https://api.hyperliquid.xyz'
  };
  wss = {
    url: 'wss://api.hyperliquid.xyz/ws'
  };

  static mainnet(): Partial<HyperliquidOptions> {
    return {
      rest: {
        url: 'https://api.hyperliquid.xyz'
      },
      wss: {
        url: 'wss://api.hyperliquid.xyz/ws'
      }
    };
  }

  static testnet(): Partial<HyperliquidOptions> {
    return {
      rest: {
        url: 'https://api.hyperliquid-testnet.xyz'
      },
      wss: {
        url: 'wss://api.hyperliquid-testnet.xyz/ws'
      }
    };
  }
}

export function options(options: Partial<HyperliquidOptions>) {
  return {
    provide: HyperliquidOptions,
    useValue: { ...new HyperliquidOptions(), ...options }
  };
}

export function useOptions() {
  return useContext(HyperliquidOptions);
}
