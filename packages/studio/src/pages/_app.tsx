import '../styles/globals.css';

import type { AppProps } from 'next/app';
import {
  PositionSnapshotProvider,
  BalanceSnapshotProvider,
  OrderSnapshotProvider
} from '../modules/session/services';

export default function Studio({ Component, pageProps }: AppProps) {
  return (
    <BalanceSnapshotProvider>
      <OrderSnapshotProvider>
        <PositionSnapshotProvider>
          <Component {...pageProps} />
        </PositionSnapshotProvider>
      </OrderSnapshotProvider>
    </BalanceSnapshotProvider>
  );
}
