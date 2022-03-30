import '../styles/globals.css';

import type { AppProps } from 'next/app';
import { BalanceSnapshotProvider } from '../modules/balance/service';
import { OrderSnapshotProvider } from '../modules/order/services';

export default function Studio({ Component, pageProps }: AppProps) {
  return (
    <BalanceSnapshotProvider>
      <OrderSnapshotProvider>
        <Component {...pageProps} />
      </OrderSnapshotProvider>
    </BalanceSnapshotProvider>
  );
}
