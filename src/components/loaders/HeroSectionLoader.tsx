export default function HeroSectionLoader() {
  return (
    <div className='bg-gradient-to-b from-[#000000] to-qacc-gray-dark relative w-full py-8 md:py-16 lg:py-0 lg:min-h-screen flex items-center justify-center overflow-hidden'>
      {/* Background Vector Placeholder */}
      <div className='pt-20 w-full absolute inset-0 flex items-center justify-center'>
        <div className='relative w-full h-full max-w-7xl xl:max-w-full xl:w-11/12 mx-auto'>
          <div className='w-full h-full bg-neutral-800/20 rounded-lg animate-pulse'></div>
        </div>
      </div>

      <div className='relative z-10 text-center px-4 sm:px-6 max-w-7xl mx-auto w-full'>
        {/* Main Title Skeleton */}
        <div className='mt-24 mb-8'>
          <div className='h-16 md:h-32 lg:h-40 xl:h-48 bg-neutral-800/60 rounded-lg mx-auto w-4/5 animate-pulse mb-2'></div>
          <div className='h-16 md:h-32 lg:h-40 xl:h-48 bg-neutral-800/60 rounded-lg mx-auto w-3/4 animate-pulse'></div>
        </div>

        {/* Play Button Skeleton */}
        <div className='absolute left-0 right-0 top-1/3 mx-auto mb-8 sm:mb-12 md:mb-16'>
          <div className='w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 xl:w-36 xl:h-36 bg-neutral-800/80 rounded-full mx-auto animate-pulse'></div>
        </div>

        {/* Stats Container Skeleton */}
        <div className='bg-white/10 backdrop-blur-[12px] rounded-2xl sm:rounded-[28px] p-4 sm:p-6 md:p-7 max-w-5xl mx-auto'>
          {/* Desktop/Tablet Layout (md and up) */}
          <div className='hidden md:block'>
            <div className='flex flex-row justify-between items-center gap-4 lg:gap-6 xl:gap-10 text-center'>
              {/* Accelerator Stats Label Skeleton */}
              <div className='-space-y-1 flex-shrink-0'>
                <div className='h-5 lg:h-6 xl:h-7 bg-neutral-800/60 rounded w-24 lg:w-28 xl:w-32 animate-pulse mb-1'></div>
                <div className='h-5 lg:h-6 xl:h-7 bg-neutral-800/60 rounded w-16 lg:w-20 xl:w-24 animate-pulse'></div>
              </div>

              {/* Stats Items Skeleton */}
              <div className='flex flex-row justify-between flex-1 gap-4 lg:gap-6'>
                {/* 6 stat items */}
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className='space-y-1'>
                    <div className='h-8 xl:h-10 bg-neutral-800/80 rounded w-12 mx-auto animate-pulse'></div>
                    <div className='h-3 bg-neutral-800/40 rounded w-16 mx-auto animate-pulse'></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile/Small Tablet Layout (sm and below) */}
          <div className='block md:hidden'>
            {/* Accelerator Stats Header Skeleton */}
            <div className='text-center mb-6'>
              <div className='h-6 sm:h-7 bg-neutral-800/60 rounded w-40 mx-auto animate-pulse'></div>
            </div>

            {/* 3x2 Grid Layout for Mobile Skeleton */}
            <div className='grid grid-cols-3 gap-4 sm:gap-6'>
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className='text-center space-y-1'>
                  <div className='h-6 sm:h-8 bg-neutral-800/80 rounded w-8 mx-auto animate-pulse'></div>
                  <div className='h-3 bg-neutral-800/40 rounded w-12 mx-auto animate-pulse'></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
