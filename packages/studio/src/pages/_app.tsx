import '../styles/globals.css';

import type { AppProps } from 'next/app';
import Head from 'next/head';
import { ChartingProvider } from '../modules/charting/charting-context';
import { ChartingThemeProvider } from '../modules/charting/charting-theme-context';
import { SessionSnapshotProvider } from '../modules/session/session-snapshot-context';

export default function Studio({ Component, pageProps }: AppProps) {
  return (
    <ChartingThemeProvider>
      <SessionSnapshotProvider>
        <ChartingProvider>
          <Head>
            <title>Studio - quantform</title>
          </Head>
          <Component {...pageProps} />
        </ChartingProvider>
      </SessionSnapshotProvider>
    </ChartingThemeProvider>
  );
}
