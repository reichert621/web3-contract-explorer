import React from 'react';

import {GithubLogo, TwitterLogo} from '@/components/Icon';

export const Footer = () => {
  return (
    <footer className="w-full bg-gray-900">
      <div className="flex w-full flex-col-reverse items-center justify-between border-t border-gray-800 px-4 py-4 text-sm sm:flex-row sm:px-8">
        <p className="mt-4 font-medium text-gray-500 sm:mt-0">© 2022</p>

        <div className="flex items-center space-x-8">
          <a
            className="text-gray-400 hover:text-gray-300"
            href="https://twitter.com/reichertjalex"
            target="_blank"
            rel="noopener noreferrer"
          >
            <TwitterLogo className="h-4 text-gray-400 hover:text-gray-300" />
          </a>
          <a
            className="text-gray-400 hover:text-gray-300"
            href="https://github.com/reichert621/web3-contract-explorer"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GithubLogo className="h-5 text-gray-400 hover:text-gray-300" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
