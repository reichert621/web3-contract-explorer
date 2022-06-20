import React from 'react';
import Web3 from 'web3';
import {AbiItem} from 'web3-utils';

import {EthNetwork} from '@/utils/index';
import {logEtherscanTransactionUrl} from '@/utils/etherscan';

const isJsonParsable = (data: any) => {
  try {
    const parsed = JSON.parse(data);

    return !!parsed;
  } catch (e) {
    return false;
  }
};

export const ContractMethodRunner = ({
  item,
  contract,
  account,
  network,
}: {
  item: AbiItem;
  contract: any;
  account: string;
  network: EthNetwork;
}) => {
  const {name, stateMutability, inputs = [], outputs = []} = item;

  const [params, setInputParams] = React.useState<Record<string, any>>(
    inputs.reduce((acc, i, idx) => {
      return {...acc, [idx]: ''};
    }, {})
  );
  const [payment, setPaymentAmount] = React.useState<number>(0);
  const [result, setInputResult] = React.useState<any>(null);
  const [error, setErrorMessage] = React.useState<string | null>(null);
  const [isRunning, setRunningTxn] = React.useState<boolean>(false);

  const isPayable = stateMutability === 'payable';
  const i = inputs
    .map((input) => (input.name ? `${input.name}: ${input.type}` : input.type))
    .join(', ');
  const o = outputs
    .map((output) =>
      output.name ? `${output.name}: ${output.type}` : output.type
    )
    .join(', ');

  const handleRunCallMethod = async () => {
    const args = Object.values(params);

    if (!name) {
      return;
    }

    const fn = contract.methods[name];

    try {
      setRunningTxn(true);
      setInputResult(null);
      setErrorMessage(null);

      if (fn && typeof fn === 'function') {
        const result = await fn(...args).call();

        setInputResult(result);
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setRunningTxn(false);
    }
  };

  const handleRunSendMethod = async () => {
    const args = Object.values(params).map((v) => {
      if (v === 'true') {
        return true;
      } else if (v === 'false') {
        return false;
      } else if (isJsonParsable(v)) {
        return JSON.parse(v);
      } else if (String(v).endsWith('eth')) {
        const eth = v.replace('eth', '').trim();

        return Web3.utils.toWei(eth);
      }

      return v;
    });

    if (!name) {
      return;
    }

    const fn = contract.methods[name];

    try {
      setRunningTxn(true);
      setInputResult(null);
      setErrorMessage(null);

      if (fn && typeof fn === 'function') {
        const opts = {from: account, value: payment};
        const result = await fn(...args)
          .send(opts)
          .on('transactionHash', (txn: string) => {
            logEtherscanTransactionUrl(txn, {network, debug: true});
          })
          .on('confirmation', (confirmation: any, receipt: any) => {
            console.debug('Transaction confirmation:', {confirmation, receipt});
          })
          .on('receipt', (receipt: any) => {
            console.debug('Transaction receipt:', receipt);
          });

        setInputResult(result);
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setRunningTxn(false);
    }
  };

  const handleRunMethod = async (e: any) => {
    e && e.preventDefault();

    if (stateMutability === 'view') {
      return handleRunCallMethod();
    } else {
      return handleRunSendMethod();
    }
  };

  return (
    <div className="mb-8 border-b">
      <div className="mb-2 font-mono">
        {item.name}({i}): {o || 'void'}
      </div>

      <form onSubmit={handleRunMethod}>
        <div className={isPayable ? 'mb-6 font-mono' : 'mb-4 font-mono'}>
          {inputs.map((input, idx) => {
            const {name, type} = input;
            const placeholder = name ? `${name}: ${type}` : type;

            return (
              <div key={`${placeholder}-${idx}`} className="mb-2">
                <input
                  className="focus:shadow-outline w-full appearance-none rounded border py-2 px-3 leading-tight text-gray-700 shadow focus:outline-none"
                  type="text"
                  placeholder={placeholder}
                  value={params[name]}
                  onChange={(e) =>
                    setInputParams({...params, [idx]: e.target.value})
                  }
                />
              </div>
            );
          })}
        </div>

        <div className="mb-4 flex items-center justify-end">
          {isPayable && (
            <div className="relative mr-4 flex w-full flex-1 items-center">
              <input
                className="focus:shadow-outline flex-1 appearance-none rounded border py-2 px-3 pr-12 text-sm font-medium leading-tight text-gray-500 shadow focus:outline-none"
                type="number"
                min={0}
                placeholder="0"
                value={payment}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
              />
              <div className="absolute right-0 px-4 text-xs font-bold tracking-wide text-gray-500">
                WEI
              </div>
            </div>
          )}

          <button
            disabled={isRunning}
            className={
              isRunning
                ? 'inline-flex cursor-not-allowed items-center justify-center rounded bg-gray-800 px-4 py-2 text-center text-sm font-bold text-gray-100 opacity-80 transition-colors hover:bg-gray-700 hover:text-white'
                : 'inline-flex items-center justify-center rounded bg-gray-800 px-4 py-2 text-center text-sm font-bold text-gray-100 transition-colors hover:bg-gray-700 hover:text-white'
            }
            onClick={handleRunMethod}
          >
            {isRunning && (
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
            {isRunning ? 'Running...' : 'Run'}
          </button>
        </div>
      </form>

      {result !== null && result !== undefined && (
        <div className="mb-4 overflow-x-scroll whitespace-pre bg-gray-100 p-4 font-mono text-sm">
          {JSON.stringify(result, null, 2)}
        </div>
      )}

      {error && (
        <div className="mb-4 overflow-x-scroll whitespace-pre bg-red-100 p-4 font-mono text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
};

export default ContractMethodRunner;
