import React from 'react';

import Image from 'next/image';

import { Button } from '@/components/ui/button';
import FAQs from './FAQs';

const About = () => {
  return (
    <div className='flex flex-col lg:flex-row items-top gap-12 p-4 sm:p-8 pb-20 md:pb-28 max-w-7xl mx-auto'>
      {/* Left Dark Card */}
      <div className=' lg:w-1/2 max-h-[620px] bg-black rounded-3xl p-6 sm:p-8 md:p-[60px] text-white relative overflow-hidden'>
        <div className='mb-8 flex items-center gap-6 justify-between'>
          <Image
            src='/images/landing/about-vector.svg'
            alt=''
            width={120}
            height={120}
            className='w-[85px] sm:w-[100px] md:w-[120px]'
          />
          <div className='flex flex-col space-y-5'>
            <p className='text-qacc-gray-light text-sm md:text-base font-medium'>
              Guaranteed liquidity
            </p>
            <p className='text-qacc-gray-light text-sm md:text-base font-medium'>
              Anti-rugpull
            </p>
            <p className='text-qacc-gray-light text-sm md:text-base font-medium'>
              Sybil resistant
            </p>
            <p className='text-qacc-gray-light text-sm md:text-base font-medium'>
              Programmatic decentralization
            </p>

            {/* Learn More Button */}
            <div className='mb-12'>
              <Button
                variant='outline'
                className='bg-transparent border-peach-400 text-peach-400 text-xs md:text-base hover:bg-peach-400 hover:text-black transition-colors rounded-lg'
              >
                LEARN MORE ABOUT Q/ACC →
              </Button>
            </div>
          </div>
        </div>

        {/* Main Heading */}
        <div className='mt-12 md:mt-24'>
          <h1 className='font-anton text-5xl lg:text-[64px] font-semibold tracking-wider leading-none'>
            THE <span className='font-anton text-peach-400'>SAFEST WAY</span>
            <br className='hidden md:block' />
            TO LAUNCH{' '}
            <span className='font-anton text-qacc-gray-light'>YOUR</span>
            <br className='hidden md:block' />
            <span className='font-anton text-qacc-gray-light'>
              TOKEN ECONOMY
            </span>
          </h1>
        </div>
      </div>

      {/* Right Light Card */}
      <FAQs />
    </div>
  );
};

export default About;
