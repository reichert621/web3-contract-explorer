import Head from 'next/head';
import React from 'react';
import Web3 from 'web3';
import {AbiItem} from 'web3-utils';
import {Contract} from 'web3-eth-contract';

import ContractMethods from '@/components/ContractMethods';
import NetworkBadge from '@/components/NetworkBadge';
import {mapAbiByFunctionType} from '@/utils/abi';
import {EthNetwork, ethereum, formatNetworkName} from '@/utils/index';
import {
  getEtherscanAddressUrl,
  isValidEtherscanNetwork,
  fetchContractAbi,
  findValidNetwork,
} from '@/utils/etherscan';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import {Spinner} from '@/components/Icon';

const getHoverColorByNetwork = (network: string) => {
  switch (network) {
    case 'goerli':
      return 'hover:text-blue-500';
    case 'rinkeby':
      return 'hover:text-amber-500';
    case 'private':
      return 'hover:text-teal-500';
    default:
      return 'hover:text-green-500';
  }
};

const callContractMethodByName = async (
  contract: Contract,
  name: string,
  ...args: any[]
) => {
  const fn = contract.methods[name];

  try {
    if (fn && typeof fn === 'function') {
      const result = await fn(...args).call();

      return result;
    } else {
      return null;
    }
  } catch (err: any) {
    console.error('Failed!', err);

    return null;
  }
};

const deriveContractMetadata = async (
  contract: Contract,
  abi: Array<AbiItem>
) => {
  const {view = []} = mapAbiByFunctionType(abi);
  const tuples = await Promise.all(
    view.map(async (item) => {
      const {name, inputs = [], type} = item;

      if (name && inputs.length === 0) {
        const data = await callContractMethodByName(contract, name);

        return [name, data];
      } else {
        return [];
      }
    })
  );

  return tuples.reduce((acc, [k, v]) => {
    if (k) {
      return {...acc, [k]: v};
    } else {
      return acc;
    }
  }, {} as Record<string, any>);
};

export const ContractDebugger = ({
  title,
  address,
  abi: defaultAbi = [],
}: {
  title?: string;
  address: string;
  abi?: Array<AbiItem>;
}) => {
  const [account, setEthAccount] = React.useState<string | null>(null);
  const [network, setEthNetwork] = React.useState<EthNetwork | null>(null);
  const [contract, setContract] = React.useState<Contract | null>(null);
  const [isLoading, setLoadingState] = React.useState(true);
  const [isPending, setPendingState] = React.useState(false);
  const [isSyncing, setSyncingState] = React.useState(false);
  const [abi, setContractAbi] = React.useState<AbiItem[]>(defaultAbi);
  const [abiString, setAbiString] = React.useState<string>(
    JSON.stringify(defaultAbi, null, 2)
  );
  const [metadata, setContractMetadata] = React.useState<Record<string, any>>(
    {}
  );
  const [abiErrorMessage, setAbiErrorMessage] = React.useState<string | null>(
    null
  );
  const [networkSuggestion, setNetworkSuggestion] = React.useState<
    string | null
  >(null);

  React.useEffect(() => {
    const init = async () => {
      if (!ethereum) {
        setLoadingState(false);

        return null;
      }

      const web3js = new Web3(ethereum);
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });
      console.debug('Found accounts:', accounts);
      const [account] = accounts;
      const network = await web3js.eth.net.getNetworkType();

      setEthAccount(account);
      setEthNetwork(network as EthNetwork);
      setLoadingState(false);
      console.debug('Contract params:', {abi, address, network});

      if (abi && abi.length > 0 && address) {
        const contract = new web3js.eth.Contract(abi, address);
        console.debug('Contract:', contract);

        setContract(contract);
      } else if (address) {
        try {
          setSyncingState(true);

          const updatedAbi = await fetchContractAbi(address, network);
          const contract = new web3js.eth.Contract(updatedAbi, address);
          console.log('Found ABI:', updatedAbi);
          setContract(contract);
          setAbiString(JSON.stringify(updatedAbi, null, 2));
          setContractAbi(updatedAbi);
          setAbiErrorMessage(null);
          setNetworkSuggestion(null);
        } catch (err: any) {
          console.error('[Mount] Failed to fetch ABI:', err);
          // Load empty contract for now
          const contract = new web3js.eth.Contract(abi, address);

          setContract(contract);
          setAbiErrorMessage(err?.message || String(err));

          if (network) {
            setNetworkSuggestion(await findValidNetwork(address, [network]));
          }
        } finally {
          setSyncingState(false);
        }
      }

      ethereum.on('accountsChanged', async (accounts: Array<string>) => {
        if (accounts.length && !accounts.includes(account)) {
          const [updated] = accounts;

          setEthAccount(updated);
        }
      });

      ethereum.on('networkChanged', async (networkId: string) => {
        const network = await web3js.eth.net.getNetworkType();

        setEthNetwork(network as EthNetwork);
      });
    };

    if (address) {
      init();
    }
  }, [address]);

  React.useEffect(() => {
    if (contract && abi) {
      deriveContractMetadata(contract, abi).then((metadata) =>
        setContractMetadata(metadata)
      );
    }
  }, [address, contract, abi, network]);

  const handleConnectWallet = async () => {
    console.debug('Connecting MetaMask!');

    if (ethereum) {
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });
      console.debug('Found accounts:', accounts);
      const [account] = accounts;

      setEthAccount(account);
    }
  };

  const handleAttemptSyncAbi = async () => {
    if (!ethereum) {
      return;
    }

    try {
      setSyncingState(true);

      const updatedAbi = await fetchContractAbi(address, network);
      const web3js = new Web3(ethereum);
      const contract = new web3js.eth.Contract(updatedAbi, address);

      setContract(contract);
      setAbiString(JSON.stringify(updatedAbi, null, 2));
      setContractAbi(updatedAbi);
      setAbiErrorMessage(null);
      setNetworkSuggestion(null);
    } catch (err: any) {
      console.error('[ABI Sync] Failed to fetch ABI:', err);
      setAbiErrorMessage(err?.message || String(err));

      if (network) {
        setNetworkSuggestion(await findValidNetwork(address, [network]));
      }
    } finally {
      setTimeout(() => setSyncingState(false), 1000);
    }
  };

  const formatAbiString = () => {
    try {
      const parsed = JSON.parse(abiString);
      const formatted = JSON.stringify(parsed, null, 2);

      setAbiString(formatted);
    } catch (e) {}
  };

  const handleUpdateAbi = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const str = e.target.value;

    setAbiString(str);

    try {
      const updatedAbi = JSON.parse(str);

      if (Array.isArray(updatedAbi)) {
        setContractAbi(updatedAbi);
      }

      if (ethereum) {
        const web3js = new Web3(ethereum);
        const contract = new web3js.eth.Contract(updatedAbi, address);

        setContract(contract);
      }
    } catch (e) {}
  };

  if (isLoading) {
    return (
      <div className="flex min-h-full flex-auto flex-col bg-gray-50">
        <Head>
          <title>Contract debugger</title>
          <meta name="description" content="Contract debugger" />
        </Head>

        <NavBar />

        <main className="flex flex-1 flex-col items-center justify-center">
          <Spinner className="h-8 w-8 animate-spin text-gray-700 opacity-20" />
        </main>

        <Footer />
      </div>
    );
  }

  if (!contract && !account) {
    // TODO: show something if no contract is found? (e.g. metamask not connected?)
    return (
      <div className="flex min-h-full flex-auto flex-col bg-gray-50">
        <Head>
          <title>Contract debugger</title>
          <meta name="description" content="Contract debugger" />
        </Head>

        <NavBar />

        <div className="mx-auto max-w-4xl flex-1 p-8">
          <button
            className="my-24 inline-flex w-64 transform items-center justify-center rounded-full border bg-white px-6 py-3 font-bold text-gray-800 transition-all hover:text-gray-900 hover:shadow sm:w-80 md:px-8 md:py-4 md:text-base"
            onClick={handleConnectWallet}
          >
            <img
              alt="MetaMask"
              src="/images/metamask.svg"
              className="-ml-2 mr-3 h-5 w-5"
            />
            <span>Connect MetaMask</span>
          </button>
        </div>

        <Footer />
      </div>
    );
  }

  if (!contract) {
    // TODO: handle this better
    return (
      <div className="flex min-h-full flex-auto flex-col bg-gray-50">
        <Head>
          <title>Contract debugger</title>
          <meta name="description" content="Contract debugger" />
        </Head>

        <NavBar />
        <main className="flex flex-1 flex-col items-center justify-center"></main>
        <Footer />
      </div>
    );
  }

  const defaultTitle = metadata?.name
    ? `Contract Explorer — ${metadata.name}`
    : 'Contract Explorer';

  return (
    <div className="flex min-h-full flex-auto flex-col bg-gray-50">
      <Head>
        <title>Contract debugger</title>
        <meta name="description" content="Contract debugger" />
      </Head>

      <NavBar />

      <main className="flex-1">
        <div className="mx-auto max-w-4xl p-4">
          <h1 className="mt-12 mb-8 border-b pb-4 text-4xl font-bold">
            {title || defaultTitle}
          </h1>

          <div className="mb-8">
            <div className="mb-1 flex items-center">
              <label className="mr-2 block text-sm font-medium text-gray-600">
                Connected account:
              </label>

              {!!account && !!network && <NetworkBadge network={network} />}
            </div>
            <p className="font-bold">{account || '--'}</p>
          </div>

          <div className="mb-8">
            <label className="mb-1 block text-sm font-medium text-gray-600">
              Contract address:
            </label>
            {address && network && isValidEtherscanNetwork(network) ? (
              <a
                className={`inline-flex items-center font-bold transition-colors ${getHoverColorByNetwork(
                  network
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                href={getEtherscanAddressUrl(address, {network})}
              >
                <span className="mr-2">{address}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            ) : (
              <p className="font-bold">--</p>
            )}
          </div>

          <div className="mb-8">
            <div className="mb-2 flex items-center justify-between">
              <label className="mb-1 block text-sm font-medium text-gray-600">
                Contract ABI:
              </label>

              <div className="flex">
                <button
                  disabled={isSyncing}
                  className="mr-2 inline-flex items-center justify-center rounded bg-gray-800 px-3 py-1 text-center text-sm text-gray-100 transition-colors hover:bg-gray-700 hover:text-white"
                  onClick={handleAttemptSyncAbi}
                >
                  {isSyncing && (
                    <Spinner className="-ml-1 mr-2 h-4 w-4 animate-spin text-white" />
                  )}
                  {isSyncing ? 'Syncing...' : 'Sync with Etherscan'}
                </button>

                <button
                  className="items-center justify-center rounded border bg-white px-3 py-1 text-center text-sm text-gray-800 transition-colors hover:bg-gray-50 hover:text-gray-900"
                  onClick={formatAbiString}
                >
                  Format
                </button>
              </div>
            </div>

            <textarea
              className={
                isSyncing
                  ? 'focus:shadow-outline w-full appearance-none rounded border bg-gray-900 py-2 px-3 font-mono text-xs leading-tight text-gray-50 opacity-80 transition-opacity focus:outline-none'
                  : 'focus:shadow-outline w-full appearance-none rounded border bg-gray-900 py-2 px-3 font-mono text-xs leading-tight text-gray-50 transition-opacity focus:outline-none'
              }
              rows={16}
              value={abiString}
              onChange={handleUpdateAbi}
            ></textarea>

            {!!abiErrorMessage && (
              <div className="mt-2 text-xs font-medium text-red-500">
                <p>
                  Failed to fetch ABI from Etherscan:{' '}
                  <span className="font-bold">{abiErrorMessage}</span>
                </p>

                {networkSuggestion ? (
                  <p>
                    Please try connecting to the{' '}
                    <span className="font-bold">
                      {formatNetworkName(networkSuggestion)}
                    </span>
                  </p>
                ) : (
                  <p>Are you on the correct network?</p>
                )}
              </div>
            )}

            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium text-gray-600">
                Public internal data:
              </label>
              <pre
                className={
                  'w-full rounded border bg-gray-900 py-2 px-3 font-mono text-xs leading-normal text-gray-50'
                }
              >
                {JSON.stringify(metadata, null, 2)}
              </pre>
            </div>
          </div>

          {account && network ? (
            <ContractMethods
              account={account}
              contract={contract}
              abi={abi}
              network={network}
            />
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContractDebugger;
