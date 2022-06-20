import type {NextPage} from 'next';
import Head from 'next/head';
import {useRouter} from 'next/router';
import React from 'react';
import Web3 from 'web3';
import {AbiItem} from 'web3-utils';

import {
  ethereum,
  fetchViaProxy,
  parseMetadataUri,
  sanitizeIpfsValues,
} from '@/utils/index';
import {fetchContractAbi, findValidNetwork} from '@/utils/etherscan';
import {fetchContractMetadataUri, fetchOpenSeaMetadata} from '@/utils/opensea';
import {extractImagePreview, formatNetworkName} from '@/utils/index';
import NetworkBadge from '@/components/NetworkBadge';

const DEFAULT_ABI: AbiItem[] = [
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'tokenURI',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'uri',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

const parseOpenSeaUrl = (
  url: string
): {
  address: string | null;
  tokenId: string | null;
  network: 'main' | 'rinkeby' | null;
} => {
  if (!url.includes('opensea.io/assets/ethereum/')) {
    return {address: null, tokenId: null, network: null};
  }

  try {
    const {host, pathname} = new URL(url);
    const path = pathname.replace('/assets/ethereum/', '');
    const [address, tokenId] = path.split('/');

    return {
      address,
      tokenId,
      network: host === 'opensea.io' ? 'main' : 'rinkeby',
    };
  } catch (e) {
    return {address: null, tokenId: null, network: null};
  }
};

const fetchContractMetadata = async ({
  address,
  abi,
  network,
  tokenId,
}: {
  address: string;
  abi: AbiItem[];
  network: string;
  tokenId: string | number;
}) => {
  if (!ethereum) {
    return null;
  }
  console.debug('Using address:', address);
  const web3js = new Web3(ethereum);
  console.debug('Found ABI:', abi);
  const contract = new web3js.eth.Contract(abi, address);
  console.debug('Calling metadata method for token:', tokenId);
  const uri = await fetchContractMetadataUri(contract, tokenId);

  if (
    uri &&
    typeof uri === 'string' &&
    !uri.includes('opensea.io/api/v1/metadata')
  ) {
    console.debug('Found contract metadata URI:', uri);
    const url = parseMetadataUri(uri);
    console.debug('Parsed contract metadata URI:', url);

    return fetchViaProxy(url)
      .then((res: Response) => res.json())
      .then((data) => sanitizeIpfsValues(data))
      .catch(() => uri);
  } else {
    return fetchOpenSeaMetadata(address, tokenId, network)
      .then((data) => {
        return {...data, _source: 'opensea'};
      })
      .catch((err) => {
        console.error('OpenSea metadata not found:', err);

        return null;
      });
  }
};

export const OpenSeaMetadata: NextPage = () => {
  const router = useRouter();
  const {query: q} = router;
  const [url, setOpenSeaUrl] = React.useState<string>(String(q?.url || ''));
  const [connectedNetwork, setConnectedNetwork] = React.useState<string>('');
  const [networkSuggestion, setNetworkSuggestion] = React.useState<
    string | null
  >(null);
  const [isLoading, setLoadingState] = React.useState(true);
  const [isPending, setPendingState] = React.useState(false);
  const [metadata, setMetadataResult] = React.useState<any>(null);
  const [error, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    const init = async () => {
      console.debug('window.ethereum:', ethereum);

      if (!ethereum) {
        setLoadingState(false);

        return null;
      }

      try {
        const web3js = new Web3(ethereum);
        const network = await web3js.eth.net.getNetworkType();

        setConnectedNetwork(network);

        ethereum.on('networkChanged', async (networkId: string) => {
          setConnectedNetwork(await web3js.eth.net.getNetworkType());
        });
      } catch (err: any) {
        console.error('Failed to find Ethereum network type:', error);
        setErrorMessage(err?.message || String(err));
      } finally {
        setLoadingState(false);
      }
    };

    init();
  }, []);

  React.useEffect(() => {
    const update = q.url ? String(q.url) : null;

    if (!url && update && update !== url) {
      setOpenSeaUrl(update);
    }
  }, [q]);

  const handleSearchMetadata = async (e?: any) => {
    e && e.preventDefault();

    setPendingState(true);
    setErrorMessage(null);
    setNetworkSuggestion(null);
    setMetadataResult(null);

    if (!ethereum) {
      setPendingState(false);
      setErrorMessage(
        'No Ethereum network has been found. Please install MetaMask, or a similar tool.'
      );

      return null;
    }

    const {address, tokenId, network} = parseOpenSeaUrl(url);

    if (!address || !tokenId || !network) {
      setPendingState(false);
      setErrorMessage('Please enter a valid OpenSea URL.');

      return null;
    }

    try {
      const abi = await fetchContractAbi(address, network);
      const result = await fetchContractMetadata({
        address,
        abi,
        network,
        tokenId,
      });

      setMetadataResult(result);

      if (network !== connectedNetwork) {
        setNetworkSuggestion(network);
      }
    } catch (err: any) {
      console.error('Failed to fetch metadata:', err);
      const msg = err?.message || String(err);
      setErrorMessage(msg);

      if (connectedNetwork) {
        const suggestion = await findValidNetwork(address, [connectedNetwork]);
        const backup = connectedNetwork !== network ? network : null;

        setNetworkSuggestion(suggestion || backup);
      }

      const result = await fetchContractMetadata({
        address,
        network,
        tokenId,
        abi: DEFAULT_ABI,
      });

      setMetadataResult(result);

      if (result && result?._source === 'opensea') {
        setErrorMessage(
          `${msg} (displaying OpenSea metadata instead of raw contract metadata)`
        );
      }
    } finally {
      setPendingState(false);

      router.push({pathname: '/debugger/os', query: {url}}, undefined, {
        shallow: true,
      });
    }
  };

  if (isLoading) {
    return null;
  }

  const imageUrl = extractImagePreview(metadata); // TODO: sometimes this is actually a video

  return (
    <div className="flex min-h-full flex-auto flex-col bg-gray-50">
      <Head>
        <title>OpenSea NFT metadata</title>
        <meta name="description" content="OpenSea NFT metadata" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex-1">
        <div className="mx-auto max-w-xl p-4">
          <div className="my-24">
            <h1 className="mb-12 text-5xl font-bold text-gray-900 sm:text-6xl">
              Inspect OpenSea.
            </h1>

            <div className="mb-8">
              <form>
                <div className="mb-1 flex items-center justify-between">
                  <label
                    className="ml-1 mr-3 block text-sm font-medium text-gray-600"
                    htmlFor="OpenSeaMetadataInput"
                  >
                    Enter OpenSea URL
                  </label>

                  {connectedNetwork && (
                    <NetworkBadge network={connectedNetwork} />
                  )}
                </div>
                <input
                  id="OpenSeaMetadataInput"
                  className="focus:shadow-outline mb-3 block w-full flex-1 appearance-none rounded border py-3 px-4 text-lg leading-tight text-gray-700 shadow focus:outline-none"
                  type="text"
                  placeholder="https://opensea.io/assets/xxxxxxxxxxxxxxxx/n"
                  value={url}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setOpenSeaUrl(e.target.value)
                  }
                />

                <button
                  disabled={isPending}
                  className={
                    isPending
                      ? 'inline-flex w-full cursor-not-allowed items-center justify-center rounded-md bg-gray-700 px-4 py-2 text-center text-lg font-medium text-gray-100 opacity-80 transition-colors'
                      : 'inline-flex w-full items-center justify-center rounded-md bg-gray-800 px-4 py-2 text-center text-lg font-medium text-gray-100 transition-colors hover:bg-gray-700 hover:text-white'
                  }
                  onClick={handleSearchMetadata}
                >
                  {isPending && (
                    <svg
                      className="-ml-1 mr-2 h-4 w-4 animate-spin text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  )}
                  {isPending
                    ? 'Searching metadata...'
                    : 'Find contract metadata'}
                </button>
              </form>

              {error && (
                <div className="my-4 text-sm text-red-500">
                  <p className="mb-2">
                    <span className="font-bold">Error: </span>
                    {error}
                  </p>

                  {networkSuggestion ? (
                    <p>
                      Please try connecting to the{' '}
                      <span className="font-bold">
                        {formatNetworkName(networkSuggestion)}
                      </span>
                    </p>
                  ) : null}
                </div>
              )}
            </div>

            {metadata && (
              <div className="mb-8 rounded border bg-white p-4 sm:-mx-4">
                {metadata !== null && metadata !== undefined && (
                  <pre className="mb-4 overflow-x-scroll whitespace-pre bg-gray-100 p-4 font-mono text-sm">
                    {JSON.stringify(metadata, null, 2)}
                  </pre>
                )}

                {imageUrl && (
                  <div className="mb-4">
                    <img
                      className="mx-auto w-full max-w-md"
                      alt="preview"
                      src={imageUrl}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default OpenSeaMetadata;
