import Footer from '@/components/Footer';
import NavBar from '@/components/NavBar';
import type {NextPage} from 'next';
import Head from 'next/head';
import Link from 'next/link';
import {useRouter} from 'next/router';
import React from 'react';
import Web3 from 'web3';

const Home: NextPage = () => {
  const router = useRouter();
  const [address, setContractAddress] = React.useState('');
  const [error, setErrorMessage] = React.useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (Web3.utils.isAddress(address)) {
      router.push(`/debugger/${address}`);
    } else {
      setErrorMessage('Please enter a valid contract address!');
    }
  };

  return (
    <div className="flex min-h-full flex-auto flex-col bg-gray-50">
      <Head>
        <title>Contract explorer</title>
        <meta name="description" content="Contract explorer home page" />
      </Head>

      <NavBar />

      <main className="flex-1">
        <div className="mx-auto max-w-xl p-4">
          <div className="my-24">
            <h1 className="mb-12 text-5xl font-bold text-gray-900 sm:text-6xl">
              Explore.
            </h1>

            <form onSubmit={handleSubmit}>
              <div className="mb-1 flex items-center justify-between">
                <label
                  className="ml-1 mr-3 block text-sm font-medium text-gray-600"
                  htmlFor="ContractSearchInput"
                >
                  Enter a contract address to inspect
                </label>
              </div>
              <input
                id="ContractSearchInput"
                className="focus:shadow-outline mb-3 block w-full flex-1 appearance-none rounded border py-3 px-4 text-lg leading-tight text-gray-700 shadow focus:outline-none"
                type="text"
                placeholder="0x0000000000000000000000000000000000000000"
                value={address}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setContractAddress(e.target.value)
                }
              />

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-md bg-gray-800 px-4 py-2 text-center text-lg font-medium text-gray-100 transition-colors hover:bg-gray-700 hover:text-white"
              >
                Search
              </button>
            </form>

            {error ? (
              <div className="my-4 text-sm text-red-500">
                <p className="mb-2">
                  <span className="font-bold">Error: </span>
                  {error}
                </p>
              </div>
            ) : (
              <div className="my-4 text-sm text-gray-500">
                <p className="mb-2">
                  Not sure what to search for? Try checking out{' '}
                  <Link href="/debugger/bayc">
                    <a className="font-medium text-blue-500">BAYC</a>
                  </Link>
                  ,{' '}
                  <Link href="/debugger/doodles">
                    <a className="font-medium text-blue-500">Doodles</a>
                  </Link>
                  , or{' '}
                  <Link href="/debugger/azuki">
                    <a className="font-medium text-blue-500">Azuki</a>
                  </Link>
                  .
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
