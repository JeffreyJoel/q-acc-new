'use server';

import { unstable_cache } from 'next/cache';

import { Db } from 'mongodb';
import { Address } from 'viem';

import { getMongoDB } from '@/lib/db';

export type AddressWhitelist = {
  deployerEOA: Address;
  fundingPotMultisig: Address;
  projectMultisig: Address;
  qAccProjectOwner: Address;
};

const cachedCheckWhitelist = unstable_cache(
  async (projectOwner: Address): Promise<AddressWhitelist | null> => {
    const db: Db = await getMongoDB();
    const result = await db
      .collection<AddressWhitelist>('addressWhitelist')
      .findOne({
        qAccProjectOwner: {
          $regex: new RegExp(`^${projectOwner}$`, 'i'),
        },
      });

    return result
      ? {
          deployerEOA: result.deployerEOA,
          fundingPotMultisig: result.fundingPotMultisig,
          projectMultisig: result.projectMultisig,
          qAccProjectOwner: result.qAccProjectOwner,
        }
      : null;
  },
  ['whitelist-check'],
  {
    revalidate: 60 * 60 * 24, // Cache for 24 hours
    tags: ['whitelist'],
  }
);

export async function checkWhitelist(
  projectOwner?: Address
): Promise<AddressWhitelist | null> {
  if (!projectOwner) {
    return null;
  }

  return cachedCheckWhitelist(projectOwner);
}
