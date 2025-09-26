export default function ProjectsLoader() {
  return (
    <div className='mx-auto px-4 sm:px-6 py-10 md:py-20 lg:px-12 flex flex-col justify-center'>
      <div>
        {/* ProjectsCarousel Skeleton - Hidden on mobile, shown on lg+ */}
        <div className='hidden lg:block'>
          <div className='relative w-full mx-auto'>
            <div className='bg-neutral-800 rounded-2xl overflow-hidden animate-pulse'>
              <div className='h-64 bg-neutral-700'></div>
              <div className='p-8 space-y-4'>
                <div className='h-8 bg-neutral-700 rounded w-3/4'></div>
                <div className='h-5 bg-neutral-700 rounded w-full'></div>
                <div className='h-5 bg-neutral-700 rounded w-2/3'></div>
                <div className='flex justify-between items-center mt-6'>
                  <div className='h-5 bg-neutral-700 rounded w-20'></div>
                  <div className='h-5 bg-neutral-700 rounded w-24'></div>
                </div>
              </div>
            </div>
            {/* Navigation dots */}
            <div className='flex justify-center mt-6 space-x-2'>
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className='w-3 h-3 bg-neutral-700 rounded-full animate-pulse'></div>
              ))}
            </div>
          </div>
        </div>

        {/* Project Tiles Grid Skeleton */}
        <div className='lg:mt-10'>
          <div className='flex flex-row gap-4 overflow-x-auto scrollbar-hide'>
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className='flex-shrink-0 w-64'>
                <div className='bg-neutral-800 rounded-2xl overflow-hidden animate-pulse'>
                  <div className='h-40 bg-neutral-700 relative'>
                    <div className='absolute bottom-3 left-3'>
                      <div className='bg-neutral-600 rounded-full p-1.5 w-8 h-8'></div>
                    </div>
                  </div>
                  <div className='p-4 space-y-2'>
                    <div className='h-5 bg-neutral-700 rounded w-4/5'></div>
                    <div className='h-4 bg-neutral-700 rounded w-full'></div>
                    <div className='h-4 bg-neutral-700 rounded w-3/4'></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Show All Projects Button Skeleton */}
        <div className='flex flex-row justify-center mt-6 md:mt-10'>
          <div className='w-full mx-10 sm:mx-0 sm:w-1/2 md:w-1/3 lg:w-1/4 rounded-xl px-6 py-2 border border-neutral-700 animate-pulse'>
            <div className='h-4 bg-neutral-700 rounded w-32 mx-auto'></div>
          </div>
        </div>

        {/* ProjectsTable Skeleton */}
        <div className='w-full max-w-7xl mx-auto lg:px-8 py-12 mt-20'>
          {/* Table Header */}
          <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4'>
            <div className='h-8 bg-neutral-800 rounded w-48 animate-pulse'></div>
            <div className='flex gap-2'>
              <div className='h-8 bg-neutral-700 rounded px-4 py-2 w-12 animate-pulse'></div>
              <div className='h-8 bg-neutral-700 rounded px-4 py-2 w-16 animate-pulse'></div>
              <div className='h-8 bg-neutral-700 rounded px-4 py-2 w-16 animate-pulse'></div>
            </div>
          </div>

          {/* Search Bar */}
          <div className='relative mb-6'>
            <div className='flex items-center bg-neutral-800 rounded-lg px-4 py-3 animate-pulse'>
              <div className='w-5 h-5 bg-neutral-600 rounded mr-3'></div>
              <div className='h-4 bg-neutral-600 rounded w-32'></div>
            </div>
          </div>

          {/* Table */}
          <div className=' bg-neutral-900 rounded-xl overflow-hidden'>
            {/* Table Header Row */}
            <div className='grid grid-cols-12 gap-4 p-4 border-b border-neutral-800'>
              {Array.from({ length: 12 }).map((_, index) => (
                <div key={index} className='h-4 bg-neutral-700 rounded animate-pulse'></div>
              ))}
            </div>

            {/* Table Rows */}
            {Array.from({ length: 10 }).map((_, rowIndex) => (
              <div key={rowIndex} className='grid grid-cols-12 gap-4 p-4 border-b border-neutral-800 last:border-b-0'>
                {/* Project column with image and text */}
                <div className='col-span-3 flex items-center space-x-3'>
                  <div className='w-10 h-10 bg-neutral-700 rounded-lg animate-pulse'></div>
                  <div className='space-y-1'>
                    <div className='h-4 bg-neutral-700 rounded w-20 animate-pulse'></div>
                    <div className='h-3 bg-neutral-600 rounded w-16 animate-pulse'></div>
                  </div>
                </div>

                {/* Other columns */}
                {Array.from({ length: 9 }).map((_, colIndex) => (
                  <div key={colIndex} className='h-4 bg-neutral-700 rounded animate-pulse'></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
