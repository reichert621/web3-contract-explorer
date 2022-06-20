import {Contract} from 'web3-eth-contract';

export const fetchOpenSeaMetadata = async (
  address: string,
  tokenId: string | number,
  network = 'main'
) => {
  const subdomain = network === 'main' ? 'api' : 'testnets-api';
  const url = `https://${subdomain}.opensea.io/api/v1/metadata/${address}/${tokenId}?format=json`;

  return fetch(url).then((res: any) => res.json());
};

export const fetchContractMetadataUri = async (
  contract: Contract,
  tokenId: string | number
) => {
  const erc721 = contract.methods.tokenURI;
  const erc1155 = contract.methods.uri;

  const isMaybeErc721 = erc721 && typeof erc721 === 'function';
  const isMaybeErc1155 = erc1155 && typeof erc1155 === 'function';

  if (!isMaybeErc721 && !isMaybeErc1155) {
    return null;
  }

  const erc721Promise = isMaybeErc721
    ? erc721(tokenId)
        .call()
        .catch(() => null)
    : Promise.resolve(null);
  const erc1155Promise = isMaybeErc1155
    ? erc1155(tokenId)
        .call()
        .catch(() => null)
    : Promise.resolve(null);

  if (isMaybeErc721 && isMaybeErc1155) {
    const options = await Promise.all([erc721Promise, erc1155Promise]);

    return options.find((opt) => !!opt && typeof opt === 'string');
  } else if (isMaybeErc721) {
    return erc721Promise;
  } else if (isMaybeErc1155) {
    return erc1155Promise;
  } else {
    return null;
  }
};
