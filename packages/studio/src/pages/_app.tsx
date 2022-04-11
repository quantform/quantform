import '../styles/globals.css';

import type { AppProps } from 'next/app';
import {
  PositionSnapshotProvider,
  BalanceSnapshotProvider,
  OrderSnapshotProvider
} from '../modules/session/services';
import Head from 'next/head';
import { ChartingProvider } from '../modules/charting/charting-context';

export default function Studio({ Component, pageProps }: AppProps) {
  return (
    <BalanceSnapshotProvider>
      <OrderSnapshotProvider>
        <PositionSnapshotProvider>
          <ChartingProvider>
            <Head>
              <title>Studio - quantform</title>
            </Head>
            <Component {...pageProps} />
          </ChartingProvider>
        </PositionSnapshotProvider>
      </OrderSnapshotProvider>
    </BalanceSnapshotProvider>
  );
}
