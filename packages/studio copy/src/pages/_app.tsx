import './styles.css';

import { AppProps } from 'next/app';
import Head from 'next/head';

function Studio({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Welcome to studio!</title>
      </Head>
      <main className="app">
        <Component {...pageProps} />
      </main>
    </>
  );
}

export default Studio;
