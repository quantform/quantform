import '../styles/globals.css';

import type { AppProps } from 'next/app';
import {
  PositionSnapshotProvider,
  BalanceSnapshotProvider,
  OrderSnapshotProvider
} from '../modules/session/services';
import Head from 'next/head';
import { MeasurementProvider } from '../modules/measurement/services/measurement-context';

export default function Studio({ Component, pageProps }: AppProps) {
  return (
    <BalanceSnapshotProvider>
      <OrderSnapshotProvider>
        <PositionSnapshotProvider>
          <MeasurementProvider>
            <Head>
              <title>Studio - quantform</title>
            </Head>
            <Component {...pageProps} />
          </MeasurementProvider>
        </PositionSnapshotProvider>
      </OrderSnapshotProvider>
    </BalanceSnapshotProvider>
  );
}
