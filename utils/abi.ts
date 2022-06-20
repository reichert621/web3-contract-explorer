import {AbiItem} from 'web3-utils';

export const getCachedAbi = (address: string) => {
  try {
    const abi = window.localStorage.getItem(`__dev:abi:${address}`);

    if (abi) {
      return JSON.parse(abi);
    } else {
      return null;
    }
  } catch (e) {
    return null;
  }
};

export const setCachedAbi = (address: string, abi: AbiItem[] | string) => {
  try {
    if (typeof abi === 'string') {
      window.localStorage.setItem(`__dev:abi:${address}`, abi);
    } else {
      window.localStorage.setItem(
        `__dev:abi:${address}`,
        JSON.stringify(abi, null, 2)
      );
    }
  } catch (e) {
    console.error('Failed to cache ABI:', e);
  }
};

const extractFunctionType = (
  item: AbiItem
): 'view' | 'nonpayable' | 'payable' | null => {
  const {payable, constant} = item;

  if (payable) {
    return 'payable';
  } else if (constant && !payable) {
    return 'view';
  } else {
    return 'nonpayable';
  }
};

export const mapAbiByFunctionType = (abi: AbiItem[]) => {
  return abi
    .filter((item) => item.type === 'function')
    .reduce(
      (acc, item) => {
        const t = item.stateMutability || extractFunctionType(item);

        if (!t) {
          return acc;
        }

        return {...acc, [t]: (acc[t] || []).concat(item)};
      },
      {payable: [], nonpayable: [], view: []} as {[key: string]: Array<AbiItem>}
    );
};

export const findTokenUriItem = (abi: AbiItem[]) => {
  return abi.find(
    (item) => item.type === 'function' && item.name === 'tokenURI'
  );
};
