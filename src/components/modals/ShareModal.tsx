import { useState, type FC } from 'react';

import Link from 'next/link';

import {
  FacebookShareButton,
  LinkedinShareButton,
  TwitterShareButton,
} from 'react-share';

// import { IconShare } from "../Icons/IconShare";
import { IconFacebook } from '@/components/icons/IconFacebook';
import { IconFarcaster } from '@/components/icons/IconFarcaster';
import { IconLinkedin } from '@/components/icons/IconLinkedin';
import { IconX } from '@/components/icons/IconX';

import { Dialog, DialogContent, DialogTitle, DialogHeader } from '../ui/dialog';

interface ShareProjectModalProps {
  showCloseButton?: boolean;
  projectSlug: string;
  projectTitle?: string;
  shareMessage?: string;
  tokenTicker?: string;
  projectData?: any;
  onClose: () => void;
  isOpen: boolean;
}

export const ShareProjectModal: FC<ShareProjectModalProps> = ({
  isOpen,
  projectTitle,
  projectSlug,
  onClose,
  tokenTicker,
  projectData,
  shareMessage = `Check out ${projectTitle} from @theqacc and $${tokenTicker}. Fair launches, legit builders and real utility.👉 `,
  ...props
}) => {
  const [copied, setCopied] = useState(false);

  const currentUrl = window.location.href;
  const url = new URL(currentUrl);
  const copyLink = `${url.protocol}//${url.host}/project/${projectSlug}`;
  const link = projectData?.socialMedia.find(
    (item: any) => item.type === 'X'
  )?.link;
  const twitterUsername = link
    ?.replace('https://', '')
    .replace('www.', '')
    .replace('x.com/', '');
  const newShareMessage = `Just backed a real Web3 startup on @theqacc. Bought $${
    projectData?.abc?.tokenTicker
  } in a true fair launch — no insiders, no VCs. Just builders and the community. \nYou’re not exit liquidity — you’re early. Round ends soon. Don’t sleep. ${
    twitterUsername ? '\n @' + twitterUsername : ''
  }😤 \n👉`;
  const handleCopy = () => {
    navigator.clipboard
      .writeText(copyLink)
      .then(() => {
        console.log('Domain name copied to clipboard:', copyLink);
        setCopied(true);

        setTimeout(() => {
          setCopied(false);
        }, 2000);
      })
      .catch(error => {
        console.error('Failed to copy domain name:', error);
      });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='bg-neutral-900 rounded-3xl w-full max-w-lg'>
        <DialogHeader>
          <DialogTitle>Share</DialogTitle>
        </DialogHeader>

        <div className='flex flex-col gap-5 font-redHatText'>
          <h1 className='text-neutral-100 font-bold text-[25px] text-center'>
            Share this with your friend!
          </h1>
          <div className='flex justify-center gap-3'>
            <div className='border border-neutral-200 rounded-lg p-2 flex items-center'>
              <TwitterShareButton
                title={shareMessage || ''}
                url={copyLink || ''}
              >
                <IconX size={24} />
              </TwitterShareButton>
            </div>
            <div className='border border-neutral-200 rounded-lg p-2 flex items-center'>
              <LinkedinShareButton
                summary={shareMessage}
                title={shareMessage}
                url={copyLink || ''}
              >
                <IconLinkedin size={24} />
              </LinkedinShareButton>
            </div>
            <div className='border border-neutral-200 rounded-lg p-2 flex items-center'>
              <FacebookShareButton
                title={shareMessage || ''}
                url={copyLink || ''}
                hashtag={shareMessage}
              >
                <IconFacebook size={24} />
              </FacebookShareButton>
            </div>
            <div className='border border-neutral-200 rounded-lg p-2 flex items-center'>
              <Link
                href={`https://warpcast.com/~/compose?embeds[]=${copyLink}&text=${shareMessage}`}
                target='_blank'
              >
                <IconFarcaster size={24} />
              </Link>
            </div>
          </div>
          <div className='flex justify-center'>
            <p className='text-neutral-200 font-medium text-xl text-center'>
              Or copy the link
            </p>
          </div>

          <div className='text-sm w-full border border-peach-300 rounded-full p-3 flex gap-2 items-center justify-between '>
            <span className='text-peach-300'> {copyLink}</span>
            <div
              onClick={handleCopy}
              className='px-3 py-2 rounded-full cursor-pointer text-neutral-800 text-xs font-medium bg-peach-400 shadow-baseShadow'
            >
              Copy Link
            </div>
          </div>
          {copied && <span className=''>Copied Link to Project</span>}

          <div className='text-center'>
            <span
              className='cursor-pointer  text-sm font-medium text-neutral-400 hover:text-red-500'
              onClick={onClose}
            >
              Dismiss
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
