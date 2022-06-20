import type {NextPage} from 'next';
import React from 'react';

import ContractDebugger from '@/components/ContractDebugger';

const AZUKI_CONTRACT_ADDRESS = '0xed5af388653567af2f388e6224dc7c4b3241c544';

const AzukiContractDebugger: NextPage = () => {
  return (
    <ContractDebugger
      title="Azuki Contract"
      address={AZUKI_CONTRACT_ADDRESS}
      abi={[]}
    />
  );
};

export default AzukiContractDebugger;
