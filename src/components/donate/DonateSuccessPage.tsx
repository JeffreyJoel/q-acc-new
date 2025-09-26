import React, { FC, useEffect, useState } from 'react';

import Link from 'next/link';

import {
  FacebookShareButton,
  LinkedinShareButton,
  TwitterShareButton,
} from 'react-share';

// import { Button } from '../Button';
import { Address } from 'viem';
import { useAccount } from 'wagmi';

import { IconFacebook } from '@/components/icons/IconFacebook';
import { IconFarcaster } from '@/components/icons/IconFarcaster';
import { IconPendingSpinner } from '@/components/icons/IconPendingSpinner';
import { IconTokenSchedule } from '@/components/icons/IconTokenSchedule';
import { IconTransactionProgress } from '@/components/icons/IconTransactionProgress';
import { IconTransactionVerified } from '@/components/icons/IconTransactionVerified';
import { IconViewTransaction } from '@/components/icons/IconViewTransaction';
import config from '@/config/configuration';
import { useDonateContext } from '@/contexts/donation.context';
import { roundPoints } from '@/helpers/points';
import { useFetchUser } from '@/hooks/useFetchUser';
import { useFetchPointsHistoryOfUser } from '@/hooks/useFetchUserPointsHistory';
import { updateDonation } from '@/services/donation.service';

import { IconLinkedin } from '../icons/IconLinkedin';
import { IconShare } from '../icons/IconShare';
import { IconX } from '../icons/IconX';

interface IDonateSuccessPage {
  transactionHash?: `0x${string}` | undefined; // Define the type for the transactionHash prop
  round?: string;
  donationId: number;
  status: string;
}
export enum DonationStatus {
  Verified = 'verified',
  Pending = 'pending',
  Failed = 'failed',
  Swap_pending = 'swap_pending',
}
const DonateSuccessPage: FC<IDonateSuccessPage> = ({
  transactionHash,
  round,
  donationId,
  status,
}) => {
  const [pointsEarned, setPointsEarned] = useState<string | null>(null);
  const { refetch: refetchPointsHistory } = useFetchPointsHistoryOfUser();
  const { projectData } = useDonateContext();
  const [donationStatus, setDonationStatus] = useState<string>(
    DonationStatus.Pending
  );
  const { address } = useAccount();
  const { refetch: refetchUser } = useFetchUser(false, address as Address);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const toggleShareModal = (state: boolean) => setIsShareModalOpen(state);
  const link = projectData?.socialMedia.find(
    (item: any) => item.type === 'X'
  )?.link;
  const twitterUsername = link
    ?.replace('https://', '')
    .replace('www.', '')
    .replace('x.com/', '');
  const shareMessage = `Just backed a real Web3 startup on @theqacc. Bought $${projectData?.abc?.tokenTicker} in a true fair launch — no insiders, no VCs. Just builders and the community. \nYou're not exit liquidity — you're early. Round ends soon. Don't sleep. \n@${twitterUsername}😤 \n👉`;

  const currentUrl = window.location.href;
  const url = new URL(currentUrl);
  const copyLink = `${url.protocol}//${url.host}/project/${projectData?.slug}`;

  useEffect(() => {
    // TODO: It should be changed!!! I think we need to make this better
    const checkDonationStatus = async () => {
      if (status === 'success') {
        setDonationStatus(DonationStatus.Pending);
        const res = await updateDonation(DonationStatus.Verified, donationId);
        // console.log(res.status);
        // setDonationStatus(DonationStatus.Verified);
        setDonationStatus(res.status);
      }
      if (status === 'error') {
        updateDonation(DonationStatus.Failed, donationId);
        setDonationStatus(DonationStatus.Failed);
      }
    };
    checkDonationStatus();
  }, [status, donationId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (donationStatus !== DonationStatus.Verified) return;

    const checkDonationStatus = async () => {
      interval = setInterval(async () => {
        const { data } = await refetchPointsHistory();
        console.log('donationId', donationId);
        const found = data?.find(
          entry =>
            entry.donation?.id && Number(entry.donation.id) === donationId
        );
        if (found) {
          clearInterval(interval);
          console.log('✅ Donation found in points history!');
          setPointsEarned(roundPoints(found.pointsEarned));
          refetchUser();
        }
      }, 3000);
    };
    checkDonationStatus();

    return () => {
      console.log('cleared interval');
      if (interval) clearInterval(interval);
    };
  }, [donationStatus, donationId, refetchPointsHistory, refetchUser]);

  return (
    <div className='flex flex-col gap-6 my-10 mx-auto container'>
      {donationStatus === DonationStatus.Pending ? (
        <div className='rounded-2xl border-2 border-border bg-background'>
          <div className='p-4 flex flex-col gap-2 font-redHatText rounded-lg'>
            <h1 className='text-peach-400 font-medium flex gap-1 items-center'>
              <IconPendingSpinner /> Processing Your Transaction…
            </h1>
            <span className='text-muted-foreground'>
              Your transaction is being processed and should be confirmed soon.
              Some transactions may take longer depending on network conditions.
            </span>
          </div>
        </div>
      ) : donationStatus === DonationStatus.Swap_pending ? (
        <div className='rounded-2xl border-2 border-blue-500 bg-background'>
          <div className='p-4 flex flex-col gap-2 font-redHatText rounded-lg'>
            <h1 className='text-blue-500 font-medium flex gap-1 items-center'>
              <IconTransactionProgress size={16} /> Transaction in Progress
            </h1>
            <div className='flex gap-2 items-center'>
              <span className='text-muted-foreground'>
                Your transaction has been sent and is being processed.
                Processing times may vary depending on the network.
              </span>
              <div className='font-medium font-redHatText'>
                <h3 className='text-muted-foreground flex gap-2'>
                  <a
                    href={`/dashboard?tab=contributions&projectId=${projectData?.id}`}
                    target='_blank'
                  >
                    <div className='flex gap-1 items-center'>
                      <span className='text-peach-400 flex gap-2 items-center hover:text-peach-300 transition-colors'>
                        Check the status
                      </span>
                      <IconViewTransaction size={16} />
                    </div>
                  </a>
                </h3>
              </div>
            </div>
          </div>
        </div>
      ) : donationStatus === DonationStatus.Verified ? (
        <div className='rounded-2xl border-2 border-green-500 bg-background'>
          <div className='p-4 flex flex-col gap-2 font-redHatText rounded-lg'>
            <h1 className='text-green-500 font-medium flex gap-1 items-center'>
              <IconTransactionVerified size={16} /> All Set! 🎉
            </h1>
            <div className='flex gap-2 items-center'>
              <span className='text-muted-foreground'>
                Your transaction is complete.
              </span>
              <div className='font-medium font-redHatText'>
                <h3 className='text-muted-foreground flex gap-2'>
                  <a
                    href={`${config.SCAN_URL}/tx/${transactionHash}`}
                    target='_blank'
                  >
                    <div className='flex gap-1 items-center'>
                      <span className='text-peach-400 flex gap-2 items-center hover:text-peach-300 transition-colors'>
                        View the transaction
                      </span>
                      <IconViewTransaction size={16} />
                    </div>
                  </a>
                </h3>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className='p-4 flex flex-col gap-2 font-redHatText rounded-lg bg-background shadow-lg border border-border'>
          <span className='text-muted-foreground'>Some error occurred</span>
        </div>
      )}
      <div className='bg-muted w-full'>
        <div className='w-full flex flex-col gap-14'>
          <div className='flex flex-col w-full lg:flex-row shadow-xl lg:rounded-xl'>
            {/* About Project */}
            <div className='w-full lg:w-1/2 lg:rounded-l-xl min-h-[450px] p-8 gap-8 flex flex-col bg-neutral-800'>
              <div
                className='w-full h-[288px] bg-cover bg-center rounded-3xl relative'
                style={{
                  backgroundImage: `url(${projectData?.image})`,
                }}
              ></div>

              <div className='flex flex-col gap-4'>
                <div>
                  <h1 className='text-foreground text-lg font-bold'>
                    {projectData?.title}
                  </h1>
                  <h3 className='font-redHatText text-peach-400'>
                    {projectData?.adminUser.name}
                  </h3>
                </div>
                <div className='text-muted-foreground font-redHatText'>
                  <p>{projectData?.teaser}</p>
                </div>
              </div>
            </div>

            {/* Your are Giver Now */}
            <div className='w-full bg-background lg:w-1/2 lg:rounded-r-xl flex flex-col gap-8 p-10 min-h-[450px]'>
              <div
                className='w-full min-h-[288px] flex flex-col gap-8'
                style={{
                  backgroundImage: "url('/images/successbg.png')",
                }}
              >
                <h1 className='text-3xl text-foreground font-bold text-center'>
                  Thank You
                </h1>
                <p className='bg-background/80 backdrop-blur-sm p-4 rounded-lg text-foreground'>
                  Tokens will be distributed at the end of the q/acc round. On
                  your q/acc profile page you may view your tokens, see the
                  unlock schedule and claim unlocked tokens once the unlock
                  stream has started.
                </p>

                {/* Token Lock Schedule */}
                <div className='flex flex-col p-4 border border-border rounded-lg gap-2 bg-background/80 backdrop-blur-sm'>
                  <div className='flex gap-2 items-center'>
                    <h1 className='font-medium text-foreground'>
                      Token Lock Schedule{' '}
                    </h1>
                    <div className='relative group'>
                      <IconTokenSchedule />
                      <div className='absolute w-[200px] z-50 mb-2 left-[-60px] hidden group-hover:block bg-neutral-800 text-white text-xs rounded py-1 px-2'>
                        <h3 className='font-bold'>Token Lock Schedule</h3>
                        {projectData?.seasonNumber === 2
                          ? `Season 2 tokens are locked for 1 year with a 6 month cliff. Tokens are locked completely for 6 months, and then unlocked gradually in a 6 month stream.`
                          : `Season 1 tokens are locked for 10 months with a 5 month cliff. Tokens are locked completely for 5 months, and then unlocked gradually in a 5 month stream. The shorter vesting is to ensure  tokens bought through q/acc always unlock before the Project's vesting completes.`}
                      </div>
                    </div>
                  </div>
                  <hr className='border-border' />
                  <h2 className='text-muted-foreground font-normal text-sm'>
                    {projectData?.seasonNumber === 2
                      ? `Season 2 tokens are locked for 1 year with a 6 month cliff. Tokens are locked completely for 6 months, and then unlocked gradually in a 6 month stream. `
                      : "Season 1 tokens are locked for 10 months with a 5 month cliff. Tokens are locked completely for 5 months, and then unlocked gradually in a 5 month stream. The shorter vesting is to ensure  tokens bought through q/acc always unlock before the Project's vesting completes."}
                  </h2>
                </div>

                <div className='border border-border bg-background rounded-lg font-redHatText text-foreground font-semibold leading-6 p-4'>
                  <div className='flex justify-between items-center'>
                    <div className='flex gap-1 items-center'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='32'
                        height='32'
                        viewBox='0 0 32 32'
                        fill='none'
                      >
                        <circle
                          cx='16'
                          cy='16'
                          r='15'
                          fill='none'
                          className='text-foreground'
                        />
                        <path
                          d='M16.9559 17.6581L23.2158 23.8003L23.9654 23.0206L17.5223 16.6986H25V15.6272H17.9338L23.8437 9.82831L23.0646 9.07754L16.9559 15.0714V8H15.864V15.0715L9.87251 9.19262L9.10038 9.95024L14.8861 15.6272H1V16.6986H15.2976L9.10818 22.7717L9.88031 23.5293L15.864 17.6581V25H16.9559V17.6581Z'
                          fill='white'
                        />
                      </svg>
                      <span>You've earned q/acc points</span>
                    </div>
                    <div className='flex gap-2 items-center'>
                      <span className='font-semibold text-peach-400 hover:text-peach-300 transition-colors'>
                        <Link href={'/leaderboard'}>Check leaderboard</Link>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='flex flex-col gap-8 bg-background py-8 px-6 rounded-2xl shadow-lg border border-border font-redHatText'>
        <div className='flex justify-center'>
          <Link href={'/projects'}>
            <button className='bg-peach-400 text-black hover:bg-peach-300 transition-colors w-[220px] flex justify-center items-center py-3 px-6 rounded-full font-medium'>
              Explore more projects
            </button>
          </Link>
        </div>

        <div className='flex gap-2 justify-center items-center'>
          <IconShare size={24} color='currentColor' />
          <span className='text-foreground text-2xl font-bold'>
            Spread the word.
          </span>
        </div>
        <div className='flex flex-col p-6 justify-center gap-6 bg-muted border border-dashed border-border rounded-xl text-center'>
          <div className='text-center text-foreground font-medium text-lg'>
            <p> Just backed a real Web3 startup on @theqacc.</p>
            <p>
              Bought ${projectData?.abc?.tokenTicker} in a true fair launch — no
              insiders, no VCs.
            </p>
            <p> Just builders and the community.</p>
            <p>You're not exit liquidity — you're early.</p>
            <p> Round ends soon. Don't sleep. 😤</p>
            <p>
              👉{' '}
              <Link
                href={copyLink}
                className='text-peach-400 hover:text-peach-300 transition-colors'
              >
                {' '}
                {copyLink}
              </Link>
            </p>
          </div>
          <div className='flex justify-center gap-6 items-center'>
            <TwitterShareButton title={shareMessage || ''} url={copyLink || ''}>
              <div className='px-6 py-3 border border-border bg-muted rounded-xl flex items-center hover:bg-neutral-700 transition-colors'>
                <IconX />
              </div>
            </TwitterShareButton>
            <LinkedinShareButton
              summary={shareMessage}
              title={shareMessage}
              url={copyLink || ''}
            >
              <div className='px-6 py-3 border border-border bg-muted rounded-xl flex items-center hover:bg-neutral-700 transition-colors'>
                <IconLinkedin />
              </div>
            </LinkedinShareButton>
            <FacebookShareButton
              title={shareMessage || ''}
              url={copyLink || ''}
            >
              <div className='px-6 py-3 border border-border bg-muted rounded-xl flex items-center hover:bg-neutral-700 transition-colors'>
                <IconFacebook />
              </div>
            </FacebookShareButton>

            <Link
              href={`https://warpcast.com/~/compose?embeds[]=${copyLink}&text=${shareMessage}`}
              target='_blank'
            >
              <div className='px-6 py-3 border border-border bg-muted rounded-xl flex items-center hover:bg-neutral-700 transition-colors'>
                <IconFarcaster size={24} />
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className='flex md:flex-row flex-col py-4 px-8 justify-center items-center gap-4'>
        {/* <div className='flex flex-col gap-2'>
          <span className='text-[#1D1E1F] font- font-semibold font-redHatText'>
            Buy more tokens?
          </span>
          <span className='text-[#1D1E1F]'>
            There are still more projects on q/acc, let's find a new token to
            buy!
          </span>
        </div> */}
      </div>
    </div>
  );
};

export default DonateSuccessPage;
