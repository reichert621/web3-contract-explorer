import type {NextPage} from 'next';
import {useRouter} from 'next/router';
import React from 'react';

import ContractDebugger from '@/components/ContractDebugger';

const DynamicContractDebugger: NextPage = () => {
  const router = useRouter();
  const {address} = router.query;

  if (!address || typeof address !== 'string') {
    return null;
  }

  return <ContractDebugger address={address} />;
};

export default DynamicContractDebugger;
