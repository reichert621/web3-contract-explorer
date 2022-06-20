import type {NextPage} from 'next';
import React from 'react';

import ContractDebugger from '@/components/ContractDebugger';

const DOODLES_CONTRACT_ADDRESS = '0x8a90cab2b38dba80c64b7734e58ee1db38b8992e';

const DoodlesContractDebugger: NextPage = () => {
  return (
    <ContractDebugger
      title="Doodles Contract"
      address={DOODLES_CONTRACT_ADDRESS}
      abi={[]}
    />
  );
};

export default DoodlesContractDebugger;
