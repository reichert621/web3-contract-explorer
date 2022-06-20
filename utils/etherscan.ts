import {EthNetwork} from '@/utils/index';

export const ETHERSCAN_API_KEY = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;

export type EtherscanTestNet = 'rinkeby' | 'ropsten';

export const isValidEtherscanTestNetwork = (
  network: string
): network is EtherscanTestNet => {
  switch (network) {
    case 'rinkeby':
    case 'ropsten':
    case 'private':
      return true;
    default:
      return false;
  }
};

export const isValidEtherscanNetwork = (
  network: string
): network is EthNetwork => {
  switch (network) {
    case 'mainnet':
    case 'main':
      return true;
    default:
      return isValidEtherscanTestNetwork(network);
  }
};

export const getEtherscanAddressUrl = (
  address: string,
  {network}: {network?: EthNetwork | EtherscanTestNet | null}
) => {
  if (network && isValidEtherscanTestNetwork(network)) {
    return `https://${network}.etherscan.io/address/${address}`;
  }

  return `https://etherscan.io/address/${address}`;
};

export const getEtherscanTransactionUrl = (
  txn: string,
  {network}: {network?: EthNetwork | EtherscanTestNet | null}
) => {
  if (network && isValidEtherscanTestNetwork(network)) {
    return `https://${network}.etherscan.io/tx/${txn}`;
  }

  return `https://etherscan.io/tx/${txn}`;
};

export const logEtherscanTransactionUrl = (
  txn: string,
  {network, debug = true}: {network?: EthNetwork; debug?: boolean}
) => {
  if (!debug || network === 'localhost' || network === 'hardhat') {
    return;
  }

  console.debug(
    'View transaction on etherscan:',
    getEtherscanTransactionUrl(txn, {network})
  );
};

const getEtherscanApiBaseUrl = (network?: string | null) => {
  switch (network) {
    case 'ropsten':
      return 'https://api-ropsten.etherscan.io';
    case 'rinkeby':
      return 'https://api-rinkeby.etherscan.io';
    case 'main':
    default:
      return 'https://api.etherscan.io';
  }
};

export const fetchContractAbi = async (
  address: string,
  network?: string | null
) => {
  const base = getEtherscanApiBaseUrl(network);
  const api = `${base}/api?module=contract&action=getabi&address=${address}&apikey=${ETHERSCAN_API_KEY}`;

  return fetch(api)
    .then((res) => res.json())
    .then((data) => {
      if (data.status === '1' && data.result) {
        return JSON.parse(data.result);
      } else if (data.status === '0') {
        throw new Error(
          `[${network || 'main'}] ${data.message} — ${data.result}`
        );
      } else {
        throw new Error(`Unexpected error: ${JSON.stringify(data)}`);
      }
    });
};

export const VALID_ETH_NETWORKS = ['main', 'ropsten', 'rinkeby'];

export const findValidNetwork = async (
  address: string,
  excluded: Array<string> = []
) => {
  const opts = VALID_ETH_NETWORKS.filter((name) => !excluded.includes(name));

  for (let network of opts) {
    try {
      const data = await fetchContractAbi(address, network);

      if (data) {
        return network;
      }
    } catch (e) {}
  }

  return null;
};
