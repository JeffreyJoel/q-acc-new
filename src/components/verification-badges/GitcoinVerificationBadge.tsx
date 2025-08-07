import React from 'react';
import Link from 'next/link';
import { IconGitcoinPassport } from '../icons/IconGitcoin';
import {
  GitcoinVerificationStatus,
  useGitcoinScore,
} from '@/hooks/useGitcoinScore';
import { Address } from 'viem';

export const GitcoinVerificationBadge = ({ userAddress }: { userAddress: Address }) => {
  const { status, userGitcoinScore } = useGitcoinScore(userAddress);
  const isVerified =
    status === GitcoinVerificationStatus.ANALYSIS_PASS ||
    status === GitcoinVerificationStatus.SCORER_PASS;

  return (
    <Link href="#" className="block">
      <div className="bg-[#74BCB433]/20 rounded-3xl p-6">
        {/* Header */}
        <div className="flex items-center justify-center mb-4">
          <h3 className="text-white font-semibold text-lg">Human Passport</h3>
        </div>

        {/* Score Display */}
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-teal-500/20 border border-teal-500/30 rounded-xl p-3">
            <IconGitcoinPassport size={24} color="#14b8a6" />
          </div>
          <div className="text-3xl font-bold text-teal-400">
            {userGitcoinScore}
          </div>
        </div>

        {/* Status Message */}
        <div className="flex items-start gap-2">
          <div className="bg-yellow-500/20 rounded-full p-1 mt-0.5">
            <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">
            {isVerified 
              ? "Your verification affects the matching pool distribution and increases your donation impact."
              : "Verify your humanity to unlock enhanced donation matching and increase funding for projects you support."
            }
          </p>
        </div>
      </div>
    </Link>
  );
};
