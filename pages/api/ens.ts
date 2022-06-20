import type {NextApiRequest, NextApiResponse} from 'next';
import {ethers} from 'ethers';

const {ALCHEMY_API_URL} = process.env;

type ResponseData =
  | {data: string | null}
  | {status: number; error: string | null};

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) => {
  const {address} = req.query;

  if (!address || typeof address !== 'string') {
    return res.status(400).json({
      status: 400,
      error: 'Please provide a wallet address',
    });
  } else if (!ALCHEMY_API_URL) {
    return res.status(500).json({
      status: 500,
      error: 'A valid ether provider has not be set up',
    });
  }

  const provider = new ethers.providers.JsonRpcProvider(ALCHEMY_API_URL);
  const ens = await provider.lookupAddress(address);

  return res.status(200).json({data: ens});
};

export default handler;
