import React from 'react';
import {Contract} from 'web3-eth-contract';

import {
  extractImagePreview,
  fetchViaProxy,
  ipfsToHttps,
  sanitizeIpfsValues,
  times,
} from '@/utils/index';

export const ContractGallery = ({
  className = '',
  account,
  contract,
}: {
  className?: string;
  account: string;
  contract: Contract;
}) => {
  const [images, setImageUrls] = React.useState<Array<string>>([]);
  const [numTokens, setNumTokens] = React.useState(0);

  const fetchImageUrlsByAddress = async (wallet: string) => {
    const balance = await contract.methods.balanceOf(wallet).call();
    const num = Number(balance);

    setNumTokens(num);

    const images = await Promise.all(
      times(num, (index: number) => {
        return contract.methods
          .tokenOfOwnerByIndex(wallet, index)
          .call()
          .then((tokenId: string) => {
            return contract.methods.tokenURI(tokenId).call();
          })
          .then((tokenUri: string) => {
            const url = tokenUri.startsWith('ipfs://')
              ? ipfsToHttps(tokenUri)
              : tokenUri;

            return fetchViaProxy(url);
          })
          .then((response: any) => response.json())
          .then((data: any) => {
            const sanitized = sanitizeIpfsValues(data);

            return extractImagePreview(sanitized);
          });
      })
    );

    setImageUrls(images);
  };

  React.useEffect(() => {
    fetchImageUrlsByAddress(account);
  }, [account, contract]);

  return (
    <div className={className}>
      <div className="mb-8 flex items-center justify-between border-b pb-2">
        <h3 className="mr-8 text-xl font-bold sm:text-2xl">Gallery</h3>
      </div>

      {numTokens > 0 || images.length > 0 ? (
        <div className={`grid grid-cols-2 gap-2 sm:grid-cols-3`}>
          {numTokens > images.length
            ? times(numTokens, (key: number) => {
                // Slight hack to handle loading state
                return <div key={key} className="h-64 rounded bg-gray-100" />;
              })
            : images.map((imageUrl, key) => {
                return <img key={key} className="rounded" src={imageUrl} />;
              })}
        </div>
      ) : (
        <div className="text-gray-500">No tokens found in connected wallet</div>
      )}
    </div>
  );
};

export default ContractGallery;
