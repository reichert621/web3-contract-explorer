import React from 'react';
import {AbiItem} from 'web3-utils';

import {
  fetchViaProxy,
  ipfsToHttps,
  sanitizeIpfsValues,
  extractImagePreview,
} from '@/utils/index';

export const ContractMetadata = ({
  item,
  contract,
}: {
  item: AbiItem;
  contract: any;
}) => {
  const {name, inputs = []} = item;

  const [params, setInputParams] = React.useState<Record<string, any>>(
    inputs.reduce((acc, i, idx) => {
      return {...acc, [idx]: ''};
    }, {})
  );
  const [result, setInputResult] = React.useState<any>(null);
  const [error, setErrorMessage] = React.useState<string | null>(null);
  const [isRunning, setRunningTxn] = React.useState<boolean>(false);

  const i = inputs
    .map((input) => (input.name ? `${input.name}: ${input.type}` : input.type))
    .join(', ');

  const imageUrl = extractImagePreview(result); // TODO: sometimes this is actually a video

  const handleRunCallMethod = async () => {
    const args = Object.values(params);
    const fn = contract.methods[name || 'tokenURI'];

    try {
      setRunningTxn(true);
      setInputResult(null);
      setErrorMessage(null);

      if (fn && typeof fn === 'function') {
        const uri = await fn(...args).call();
        const url = uri.startsWith('ipfs://') ? ipfsToHttps(uri) : uri;
        const result = await fetchViaProxy(url)
          .then((res: any) => res.json())
          .then((data) => sanitizeIpfsValues(data))
          .catch(() => uri);

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

    return handleRunCallMethod();
  };

  return (
    <div className="mb-8 border-b">
      <div className="mb-2 font-mono">metadata({i})</div>

      <form onSubmit={handleRunMethod}>
        <div className="mb-4 font-mono">
          {inputs.map((input, idx) => {
            const {name, type} = input;
            const placeholder = name ? `${name}: ${type}` : type;

            return (
              <div key={placeholder} className="mb-2">
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

        <div className="mb-4 flex justify-end">
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

      {imageUrl && (
        <div className="mb-4">
          <img className="mx-auto w-full max-w-md" alt={name} src={imageUrl} />
        </div>
      )}

      {error && (
        <div className="mb-4 font-mono text-sm text-red-600">{error}</div>
      )}
    </div>
  );
};

export default ContractMetadata;
