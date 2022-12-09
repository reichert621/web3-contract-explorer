export type EthNetwork =
  | 'hardhat'
  | 'localhost'
  | 'private'
  | 'rinkeby'
  | 'ropsten'
  | 'mainnet'
  | 'goerli'
  | 'kovan'
  | 'main';

export const SUPPORTED_CHAIN_IDS = [1, 3, 4, 5, 42];

export const ChainIDToNetwork: {[key: number]: EthNetwork} = {
  1: 'mainnet',
  3: 'ropsten',
  4: 'rinkeby',
  5: 'goerli',
  42: 'kovan',
};

export const ethereum =
  typeof window !== 'undefined' ? (window as any)?.ethereum : undefined;

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const times = (n: number, fn: (index: number) => any) =>
  Array.from({length: n}).map((_, index) => fn(index));

export const fetchViaProxy = (url: string) => {
  return fetch(`/api/metadata?url=${url}`);
};

export const ipfsToHttps = (uri: string) => {
  const path = uri.replace('ipfs://', '');

  return `https://ipfs.io/ipfs/${path}`;
};

export const arweaveToHttps = (uri: string) => {
  const path = uri.replace('ar://', '');

  return `https://arweave.net/${path}`;
};

export const parseMetadataUri = (uri: string) => {
  if (uri.startsWith('ipfs://')) {
    return ipfsToHttps(uri);
  } else if (uri.startsWith('ar://')) {
    return arweaveToHttps(uri);
  } else {
    return uri;
  }
};

export const sanitizeIpfsValues = (obj: Record<any, any>): Record<any, any> => {
  return Object.keys(obj).reduce((acc, key) => {
    const value = acc[key];

    if (value && typeof value === 'string' && value.startsWith('ipfs://')) {
      return {...acc, [`_${key}`]: ipfsToHttps(value)};
    } else if (
      typeof value === 'object' &&
      Object.keys(value).length > 0 &&
      !Array.isArray(value)
    ) {
      return {...acc, [key]: sanitizeIpfsValues(value)};
    }

    return acc;
  }, obj);
};

export const extractImagePreview = (data?: Record<string, string> | null) => {
  if (!data) {
    return null;
  }

  return data._image || data._image_url || data.image || data.image_url;
};

export const formatNetworkName = (network: string) => {
  switch (network) {
    case 'goerli':
      return 'Goerli Test Network';
    case 'rinkeby':
      return 'Rinkeby Test Network';
    case 'main':
    default:
      return 'Ethereum Main Network';
  }
};
