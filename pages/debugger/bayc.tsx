import type {NextPage} from 'next';
import React from 'react';

import ContractDebugger from '@/components/ContractDebugger';

const BAYC_CONTRACT_ADDRESS = '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d';

const BAYCContractDebugger: NextPage = () => {
  return (
    <ContractDebugger
      title="BAYC Contract"
      address={BAYC_CONTRACT_ADDRESS}
      abi={[]}
    />
  );
};

export default BAYCContractDebugger;
