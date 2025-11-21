'use client';

import { useCallback, useEffect, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import Autoplay from 'embla-carousel-autoplay';
import { AnimatePresence, Variants, motion, useAnimation } from 'motion/react';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { capitalizeFirstLetter } from '@/helpers';
import { cn } from '@/lib/utils';

interface Tip {
  text: string;
  image: string;
  url?: string;
  description?: string;
  donations?: number;
  supporters?: number;
  marketCap?: number;
}

export interface CarouselProps {
  tips?: Tip[];
  className?: string;
  autoplayInterval?: number;
  showNavigation?: boolean;
  showIndicators?: boolean;
  showProgress?: boolean;
  aspectRatio?: 'video' | 'square' | 'wide';
  textPosition?: 'top' | 'bottom';
  onTipChange?: (index: number) => void;
  backgroundTips?: boolean;
  shuffleTips?: boolean;
  animateText?: boolean;
}

const carouselVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
  }),
};

const textVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.5 } },
};

const aspectRatioClasses = {
  video: 'aspect-video',
  square: 'aspect-square',
  wide: 'aspect-[2/1]',
};

export function ProjectsCarousel({
  onTipChange,
  className,
  tips,
  showProgress = true,
  aspectRatio = 'wide',
  showNavigation = false,
  showIndicators = true,
  backgroundTips = false,
  autoplayInterval = 4500,
}: CarouselProps) {
  const [progress, setProgress] = useState(0);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const controls = useAnimation();

  const autoplay = Autoplay({
    delay: autoplayInterval,
    stopOnInteraction: false,
  });

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());
    setDirection(
      api.scrollSnapList().indexOf(api.selectedScrollSnap()) - current
    );

    const onSelect = () => {
      const newIndex = api.selectedScrollSnap();
      setCurrent(newIndex);
      setDirection(api.scrollSnapList().indexOf(newIndex) - current);
      onTipChange?.(newIndex);
    };

    api.on('select', onSelect);

    return () => {
      api.off('select', onSelect);
    };
  }, [api, current, onTipChange]);

  useEffect(() => {
    if (!showProgress) return;

    const timer = setInterval(() => {
      setProgress(oldProgress => {
        if (oldProgress === 100) {
          return 0;
        }
        const diff = 2;
        return Math.min(oldProgress + diff, 100);
      });
    }, autoplayInterval / 50);

    return () => {
      clearInterval(timer);
    };
  }, [showProgress, autoplayInterval]);

  useEffect(() => {
    if (progress === 100) {
      controls.start({ scaleX: 0 }).then(() => {
        setProgress(0);
        controls.set({ scaleX: 1 });
      });
    } else {
      controls.start({ scaleX: progress / 100 });
    }
  }, [progress, controls]);

  const handleSelect = useCallback(
    (index: number) => {
      api?.scrollTo(index);
    },
    [api]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className={cn(
        'w-full mx-auto rounded-3xl bg-muted shadow-[0px_1px_1px_0px_rgba(0,0,0,0.05),0px_1px_1px_0px_rgba(255,252,240,0.5)_inset,0px_0px_0px_1px_hsla(0,0%,100%,0.1)_inset,0px_0px_1px_0px_rgba(28,27,26,0.5)]',
        className
      )}
    >
      <div className='w-full max-h-[630px] overflow-hidden rounded-3xl'>
        <Carousel
          setApi={setApi}
          plugins={[autoplay]}
          className='w-full relative'
          opts={{
            loop: true,
          }}
        >
          {/* Absolute top-center indicator */}
          {showIndicators && !backgroundTips && (
            <div className='absolute top-20 left-20  z-10 flex space-x-2'>
              {(tips || []).map((_, index) => (
                <motion.button
                  key={index}
                  className={`h-1 w-8 flex-shrink-0 rounded-full ${
                    index === current ? 'bg-muted' : 'bg-primary'
                  }`}
                  initial={false}
                  animate={{
                    backgroundColor:
                      index === current ? '#FBBA80' : '#FBBA8033',
                  }}
                  transition={{ duration: 0.5 }}
                  onClick={() => handleSelect(index)}
                  aria-label={`Go to tip ${index + 1}`}
                />
              ))}
            </div>
          )}
          <CarouselContent>
            <AnimatePresence initial={false} custom={direction}>
              {(tips || []).map((tip, index) => (
                <CarouselItem key={index}>
                  <motion.div
                    variants={carouselVariants}
                    initial='enter'
                    animate='center'
                    exit='exit'
                    custom={direction}
                    transition={{ duration: 0.8, ease: 'easeInOut' }}
                    className={`relative ${aspectRatioClasses[aspectRatio]} w-full overflow-hidden`}
                  >
                    <Image
                      src={tip.image}
                      alt={`Visual representation for tip: ${tip.text}`}
                      fill
                      className='object-cover object-right'
                      priority
                    />
                    <div className='absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/70 to-transparent' />
                    <div className='absolute pl-20 py-40 w-full h-full flex flex-col  items-start z-10'>
                      <span className='uppercase text-[8px] text-black font-bold py-1 px-2 rounded-lg bg-qacc-gray-light mb-4'>
                        Featured Project
                      </span>
                      <div className='max-w-2xl'>
                        <h2 className='font-anton text-white text-4xl md:text-[40px] font-normal mb-4 drop-shadow-lg uppercase'>
                          {tip.text}
                        </h2>

                        {tip.description && (
                          <p className='max-w-lg leading-[18px] text-white text-sm font-medium mb-6 drop-shadow-lg'>
                            {capitalizeFirstLetter(tip.description) ||
                              'No description available'}
                          </p>
                        )}
                        {/* Stats row */}
                        <div className='flex flex-row gap-12 mb-8'>
                          <div className='flex flex-col items-start'>
                            <span className='text-white text-2xl md:text-3xl font-bold leading-tight'>
                              {tip.donations?.toLocaleString(undefined, {
                                style: 'currency',
                                currency: 'USD',
                                maximumFractionDigits: 0,
                              })}
                            </span>
                            <span className='text-neutral-500 text-[13px] text-center font-medium tracking-wide'>
                              Total received
                            </span>
                          </div>
                          <div className='flex flex-col items-start'>
                            <span className='text-white text-2xl md:text-3xl font-bold leading-tight'>
                              {tip.supporters?.toLocaleString()}
                            </span>
                            <span className='text-neutral-500 text-[13px] text-center font-medium tracking-wide'>
                              Supporters
                            </span>
                          </div>
                          <div className='flex flex-col items-start'>
                            <span className='text-white text-2xl md:text-3xl font-bold leading-tight'>
                              {tip.marketCap?.toLocaleString(undefined, {
                                style: 'currency',
                                currency: 'USD',
                                maximumFractionDigits: 0,
                              })}
                            </span>
                            <span className='text-neutral-500 text-[13px] text-center font-medium tracking-wide'>
                              Market Cap
                            </span>
                          </div>
                        </div>

                        <div>
                          <Link href={tip?.url || ''}>
                            <button className='rounded-xl px-6 py-3 bg-peach-400 text-black text-lg font-medium tracking-wide'>
                              SWAP TOKENS
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </CarouselItem>
              ))}
            </AnimatePresence>
          </CarouselContent>
          {showNavigation && (
            <>
              <CarouselPrevious className='absolute left-2 top-1/2 -translate-y-1/2' />
              <CarouselNext className='absolute right-2 top-1/2 -translate-y-1/2' />
            </>
          )}
        </Carousel>
      </div>
    </motion.div>
  );
}

ProjectsCarousel.displayName = 'ProjectsCarousel';
