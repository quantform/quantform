import '../styles/globals.css';

import type { AppProps } from 'next/app';

export default function Studio({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
