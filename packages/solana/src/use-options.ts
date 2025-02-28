import { provider, useContext } from '@quantform/core';

@provider()
export class SolanaOptions {
  http = {
    url: 'https://api.mainnet-beta.solana.com'
  };
  wss = {
    url: 'wss://api.mainnet-beta.solana.com'
  };

  static mainnet(): Partial<SolanaOptions> {
    return {
      http: {
        url: 'https://api.mainnet-beta.solana.com'
      },
      wss: {
        url: 'wss://api.mainnet-beta.solana.com'
      }
    };
  }

  static devnet(): Partial<SolanaOptions> {
    return {
      http: {
        url: 'https://api.devnet.solana.com'
      },
      wss: {
        url: 'wss://api.devnet.solana.com'
      }
    };
  }

  static testnet(): Partial<SolanaOptions> {
    return {
      http: {
        url: 'https://api.testnet.solana.com'
      },
      wss: {
        url: 'wss://api.testnet.solana.com'
      }
    };
  }
}

export function options(options: Partial<SolanaOptions>) {
  return {
    provide: SolanaOptions,
    useValue: { ...new SolanaOptions(), ...options }
  };
}

export function useOptions() {
  return useContext(SolanaOptions);
}
