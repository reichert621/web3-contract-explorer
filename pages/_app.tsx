import 'react-toastify/dist/ReactToastify.css';
import '../styles/globals.css';

import type {AppProps} from 'next/app';
import {ToastContainer} from 'react-toastify';
import Head from 'next/head';
import React from 'react';

function WrappedBaseApp({Component, pageProps}: AppProps) {
  return (
    <>
      <Head>
        <meta
          property="og:title"
          content="Web3 Contract Explorer"
          key="title"
        />
        <meta
          property="og:description"
          content="Inspect and run web3 contract methods"
          key="description"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ToastContainer autoClose={8000} theme="dark" />
      <Component {...pageProps} />
    </>
  );
}

export default WrappedBaseApp;
