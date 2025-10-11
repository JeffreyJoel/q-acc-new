export default function DonatePageLoader() {
  return (
    <div className='min-h-screen bg-neutral-900 p-4'>
      <div className='max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Left Column */}
        <div className='space-y-6'>
          {/* Info Card Skeleton */}
          <div className='bg-neutral-800 rounded-2xl p-6 animate-pulse'>
            <div className='h-6 bg-neutral-700 rounded-md w-48 mb-4'></div>
            <div className='space-y-3'>
              <div className='h-4 bg-neutral-700 rounded w-full'></div>
              <div className='h-4 bg-neutral-700 rounded w-3/4'></div>
            </div>
            <div className='mt-6 space-y-3'>
              <div className='flex items-start space-x-2'>
                <div className='w-2 h-2 bg-neutral-700 rounded-full mt-2 flex-shrink-0'></div>
                <div className='flex-1 space-y-2'>
                  <div className='h-4 bg-neutral-700 rounded w-full'></div>
                  <div className='h-4 bg-neutral-700 rounded w-1/2'></div>
                </div>
              </div>
              <div className='flex items-start space-x-2'>
                <div className='w-2 h-2 bg-neutral-700 rounded-full mt-2 flex-shrink-0'></div>
                <div className='flex-1'>
                  <div className='h-4 bg-neutral-700 rounded w-3/4'></div>
                </div>
              </div>
            </div>
          </div>

          {/* Wallet Balance Section */}
          <div className='space-y-4'>
            <div className='flex items-center justify-between animate-pulse'>
              <div className='h-5 bg-neutral-700 rounded w-40'></div>
              <div className='h-5 bg-neutral-700 rounded w-24'></div>
            </div>

            <div className='flex space-x-3 animate-pulse'>
              <div className='h-10 bg-neutral-700 rounded-full w-16'></div>
              <div className='h-10 bg-neutral-700 rounded-full w-16'></div>
              <div className='h-10 bg-neutral-700 rounded-full w-16'></div>
            </div>
          </div>

          {/* Token Selection and Amount */}
          <div className='bg-neutral-800 rounded-xl p-4 animate-pulse'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-3'>
                <div className='w-8 h-8 bg-neutral-700 rounded-full'></div>
                <div className='h-5 bg-neutral-700 rounded w-12'></div>
                <div className='w-4 h-4 bg-neutral-700 rounded'></div>
              </div>
              <div className='h-6 bg-neutral-700 rounded w-16'></div>
            </div>
          </div>

          {/* Cap and Minimum Info */}
          <div className='space-y-3 animate-pulse'>
            <div className='flex items-center justify-between'>
              <div className='h-4 bg-neutral-700 rounded w-48'></div>
              <div className='w-5 h-5 bg-neutral-700 rounded'></div>
            </div>
            <div className='flex items-center justify-between'>
              <div className='h-4 bg-neutral-700 rounded w-40'></div>
              <div className='h-4 bg-neutral-700 rounded w-16'></div>
            </div>
          </div>

          {/* Token Unlock Schedule */}
          <div className='space-y-4 animate-pulse'>
            <div className='flex items-center space-x-2'>
              <div className='h-6 bg-neutral-700 rounded w-44'></div>
              <div className='w-5 h-5 bg-neutral-700 rounded'></div>
            </div>
            <div className='space-y-3'>
              <div className='h-4 bg-neutral-700 rounded w-full'></div>
              <div className='h-4 bg-neutral-700 rounded w-full'></div>
              <div className='h-4 bg-neutral-700 rounded w-full'></div>
              <div className='h-4 bg-neutral-700 rounded w-3/4'></div>
              <div className='h-4 bg-neutral-700 rounded w-full'></div>
              <div className='h-4 bg-neutral-700 rounded w-5/6'></div>
            </div>
          </div>

          {/* Buy Button */}
          <div className='h-14 bg-neutral-700 rounded-xl animate-pulse'></div>
        </div>

        {/* Right Column */}
        <div className='space-y-6'>
          {/* Project Card Skeleton */}
          <div className='bg-neutral-800 rounded-2xl p-6 h-64 animate-pulse'>
            <div className='h-full flex flex-col justify-between'>
              <div className='space-y-3'>
                <div className='h-8 bg-neutral-700 rounded w-48'></div>
                <div className='h-4 bg-neutral-700 rounded w-3/4'></div>
                <div className='h-4 bg-neutral-700 rounded w-1/2'></div>
              </div>
              <div className='flex items-end justify-between'>
                <div className='w-12 h-12 bg-neutral-700 rounded-lg'></div>
                <div className='flex space-x-2'>
                  <div className='w-8 h-8 bg-neutral-700 rounded'></div>
                  <div className='w-8 h-8 bg-neutral-700 rounded'></div>
                  <div className='w-8 h-8 bg-neutral-700 rounded'></div>
                  <div className='w-8 h-8 bg-neutral-700 rounded'></div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className='space-y-4'>
            <div className='animate-pulse'>
              <div className='h-4 bg-neutral-700 rounded w-40 mb-3'></div>
              <div className='flex items-baseline space-x-3'>
                <div className='h-12 bg-neutral-700 rounded w-32'></div>
                <div className='h-6 bg-neutral-700 rounded w-20'></div>
              </div>
              <div className='mt-2'>
                <div className='h-4 bg-neutral-700 rounded w-28'></div>
              </div>
            </div>

            {/* Total Supply */}
            <div className='bg-neutral-800 rounded-xl p-4 animate-pulse'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-2'>
                  <div className='w-5 h-5 bg-neutral-700 rounded'></div>
                  <div className='h-4 bg-neutral-700 rounded w-24'></div>
                </div>
                <div className='h-5 bg-neutral-700 rounded w-32'></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
