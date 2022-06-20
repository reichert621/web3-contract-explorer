import React from 'react';
import {AbiItem} from 'web3-utils';
import {Contract} from 'web3-eth-contract';

import ContractMetadata from '@/components/ContractMetadata';
import ContractMethodRunner from '@/components/ContractMethodRunner';
import {mapAbiByFunctionType, findTokenUriItem} from '@/utils/abi';
import {EthNetwork} from '@/utils/index';

const keyify = (item: AbiItem) => {
  const {name, inputs = [], outputs = []} = item;

  return `${name}:${inputs.length}:${outputs.length}`;
};

const isIncludedByQuery = (item: AbiItem, query?: string) => {
  const q = (query || '').trim().toLowerCase();

  if (!q || !q.length) {
    return true;
  }

  const {name = ''} = item;
  const words = q.split(' ');

  return words.every((word) => {
    return name.toLowerCase().includes(word);
  });
};

export const ContractMethods = ({
  account,
  contract,
  abi,
  network,
}: {
  account: string;
  contract: Contract;
  abi: Array<AbiItem>;
  network: EthNetwork;
}) => {
  const [query, setSearchQuery] = React.useState('');

  const grouped = mapAbiByFunctionType(abi);
  const tokenUriItem = findTokenUriItem(abi);
  const readonly = grouped.view.filter((item) =>
    isIncludedByQuery(item, query)
  );
  const nonpayable = grouped.nonpayable.filter((item) =>
    isIncludedByQuery(item, query)
  );
  const payable = grouped.payable.filter((item) =>
    isIncludedByQuery(item, query)
  );

  return (
    <div className="my-10">
      {!!tokenUriItem && (
        <div className="mb-8 rounded border bg-white p-8">
          <h3 className="mb-8 border-b pb-2 text-xl font-bold sm:text-2xl">
            Metadata
          </h3>

          <ContractMetadata item={tokenUriItem} contract={contract} />
        </div>
      )}

      {abi.length > 0 && (
        <div className="mt-12 mb-8 px-8">
          <label className="mb-1 ml-1 block text-sm font-medium text-gray-600">
            Search contract methods
          </label>
          <input
            className="focus:shadow-outline w-full appearance-none rounded border py-3 px-4 text-lg leading-tight text-gray-700 shadow focus:outline-none"
            type="text"
            placeholder={`Enter search query (e.g. "mint")`}
            value={query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(e.target.value)
            }
          />
        </div>
      )}

      {grouped.view && grouped.view.length > 0 && (
        <div className="mb-8 rounded border bg-white p-8">
          <h3 className="mb-8 border-b pb-2 text-xl font-bold sm:text-2xl">
            Read-only methods
          </h3>

          {readonly.length > 0 ? (
            readonly.map((item) => {
              return (
                <ContractMethodRunner
                  key={keyify(item)}
                  item={item}
                  contract={contract}
                  account={account}
                  network={network}
                />
              );
            })
          ) : (
            <p className="text-gray-500">None available</p>
          )}
        </div>
      )}

      {grouped.nonpayable && grouped.nonpayable.length > 0 && (
        <div className="mb-8 rounded border bg-white p-8">
          <h3 className="mb-8 border-b pb-2 text-xl font-bold sm:text-2xl">
            Non-payable transactions
          </h3>

          {nonpayable.length > 0 ? (
            nonpayable.map((item) => {
              return (
                <ContractMethodRunner
                  key={keyify(item)}
                  item={item}
                  contract={contract}
                  account={account}
                  network={network}
                />
              );
            })
          ) : (
            <p className="text-gray-500">None available</p>
          )}
        </div>
      )}

      {grouped.payable && grouped.payable.length > 0 && (
        <div className="mb-8 rounded border bg-white p-8">
          <h3 className="mb-8 border-b pb-2 text-xl font-bold sm:text-2xl">
            Payable transactions
          </h3>

          {payable.length > 0 ? (
            payable.map((item) => {
              return (
                <ContractMethodRunner
                  key={keyify(item)}
                  item={item}
                  contract={contract}
                  account={account}
                  network={network}
                />
              );
            })
          ) : (
            <p className="text-gray-500">None available</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ContractMethods;
