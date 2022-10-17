import './styles.css';

import { AppProps } from 'next/app';
import Head from 'next/head';
import React from 'react';

import { useAppStore } from '../hooks/useAppStore';

function Studio({ Component, pageProps }: AppProps) {
  const { title } = useAppStore();

  return (
    <>
      <Head>
        <title>{title} - quantform</title>
      </Head>
      <main className="app">
        <Component {...pageProps} />
      </main>
    </>
  );
}

export default Studio;
