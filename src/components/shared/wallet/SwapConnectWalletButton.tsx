'use client';

import { usePrivy } from '@privy-io/react-auth';

export default function ConnectWalletButton() {
  const { login } = usePrivy();

  return (
    <button
      type='button'
      onClick={login}
      className='mt-4 mb-1 bg-peach-400 text-black font-semibold py-4 rounded-[18px] w-full'
    >
      Connect Wallet
    </button>
  );
}
