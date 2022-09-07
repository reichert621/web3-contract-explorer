import React from 'react';
import Link from 'next/link';
import {useRouter} from 'next/router';

export const NavBar = () => {
  const router = useRouter();

  return (
    <nav className="w-full border-b border-gray-900 bg-gray-900">
      <div className="flex h-14 px-4 py-2 sm:px-8">
        <div className="flex w-full items-center justify-between">
          <div className="flex flex-shrink-0 items-center">
            <Link href={'/'}>
              <a className="text-sm font-bold text-white">
                <img src="/images/ethereum.svg" className="w-4" />
              </a>
            </Link>
          </div>
          <div className="mx-8 flex-1">
            <div className="hidden space-x-4 sm:flex">
              <Link href={'/'}>
                <a
                  className={
                    router.pathname === '/'
                      ? 'hidden rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white'
                      : 'rounded-md px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white'
                  }
                >
                  Search for a contract
                </a>
              </Link>

              <a
                className={
                  'hidden rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white'
                }
                href="https://github.com/reichert621/appointments"
                target="_blank"
                rel="noopener noreferrer"
              >
                Source code
              </a>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <a
              className="inline-flex items-center rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-gray-100 transition-colors hover:bg-gray-700 hover:text-white"
              href="https://github.com/reichert621/appointments"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="mr-2 h-4 w-4 text-amber-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                />
              </svg>
              <span>Star on GitHub</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1024 1024"
                fill="currentColor"
                className="ml-2 h-4"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z"
                  transform="scale(64)"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
