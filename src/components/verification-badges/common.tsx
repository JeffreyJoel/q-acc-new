import { type HTMLAttributes } from 'react';

export const getBadgeClasses = (
  isVerified: boolean
): HTMLAttributes<HTMLDivElement>['className'] =>
  `flex gap-1 ${isVerified ? 'bg-teal-500 text-white' : 'bg-neutral-800 text-white border-red-500 border-[1px]'} py-2 px-3 rounded-lg`;
