import { NextResponse, NextRequest } from 'next/server';

import { Collection } from 'mongodb';

import { ABC_LAUNCH_COLLECTION } from '@/lib/constants/abc';
import { getMongoDB } from '@/lib/db';

export interface Abc {
  tokenTicker: string;
  tokenName: string;
  icon: string;
  orchestratorAddress: string;
  issuanceTokenAddress: string;
  fundingManagerAddress: string;
  projectAddress: string;
  creatorAddress: string;
  nftContractAddress: string;
  chainId: number;
}

async function getProjectAbcLaunchData(
  projectAddress: string
): Promise<Abc | null> {
  try {
    const db = await getMongoDB();
    const projectCollection: Collection = db.collection(ABC_LAUNCH_COLLECTION);
    const abc = await projectCollection.findOne({
      projectAddress: projectAddress.toLocaleLowerCase(),
    });

    // console.log(`get abc of project address ${projectAddress} `, abc);

    return (
      abc && {
        tokenTicker: abc.tokenTicker,
        tokenName: abc.tokenName,
        icon: abc.iconHash,
        orchestratorAddress: abc.orchestratorAddress,
        issuanceTokenAddress: abc.issuanceTokenAddress,
        fundingManagerAddress: abc.fundingManagerAddress,
        projectAddress: abc.projectAddress,
        creatorAddress: abc.userAddress,
        nftContractAddress: abc.nftContractAddress,
        chainId: abc.chainId,
      }
    );
  } catch (e) {
    console.error(`get abc of project address ${projectAddress} error `, e);
    throw e;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const address = params.address;

    if (!address) {
      return NextResponse.json(
        { error: 'Missing address parameter' },
        { status: 400 }
      );
    }

    const result = await getProjectAbcLaunchData(
      '0x06ee820a94d7f23d3d3468a159737287059edddf'
    );

    if (!result) {
      return NextResponse.json(
        { error: `ABC data not found for project address: ${address}` },
        { status: 404 }
      );
    }
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/projects/abc/[address] handler:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
