import '../styles/globals.css';

import type { AppProps } from 'next/app';
import { OrderProvider, BalanceProvider } from '../components/session-context';

export default function Studio({ Component, pageProps }: AppProps) {
  return (
    <BalanceProvider>
      <OrderProvider>
        <Component {...pageProps} />
      </OrderProvider>
    </BalanceProvider>
  );
}
