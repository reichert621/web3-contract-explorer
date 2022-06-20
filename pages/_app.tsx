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
        <meta property="og:title" content="TODO" key="title" />
        <meta
          property="og:description"
          content="TODO: description"
          key="description"
        />
        <meta property="og:image" content="TODO: image url" key="og-image" />
      </Head>
      <ToastContainer autoClose={8000} theme="dark" />
      <Component {...pageProps} />
    </>
  );
}

export default WrappedBaseApp;
