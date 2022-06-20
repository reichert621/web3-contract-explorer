import type {NextApiRequest, NextApiResponse} from 'next';
import Cors from 'cors';

// Initializing the cors middleware
const cors = Cors({
  methods: ['GET'],
});

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
async function middleware(
  req: NextApiRequest,
  res: NextApiResponse<any>,
  fn: (
    req: NextApiRequest,
    res: NextApiResponse<any>,
    cb: (data: any) => any
  ) => any
) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  await middleware(req, res, cors);

  const {url} = req.query;

  if (url && typeof url === 'string') {
    const data = await fetch(url).then((res) => res.json());

    res.status(200).json(data);
  } else {
    res.status(400).json({error: 'Please provide a valid URL'});
  }
}
