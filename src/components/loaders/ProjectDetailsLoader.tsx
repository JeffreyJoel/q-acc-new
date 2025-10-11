export default function ProjectDetailsLoader() {
  return (
    <div className='w-full max-w-6xl mx-auto'>
      {/* Header banner skeleton */}
      <div className='relative w-full h-64 bg-neutral-800 rounded-t-lg overflow-hidden'>
        {/* <div className="absolute inset-0 bg-neutral-800 animate-pulse"></div> */}

        {/* Logo and tagline skeleton */}
        <div className='absolute bottom-20 left-10 flex items-center gap-4'>
          <div className='w-48 h-12 bg-neutral-700 rounded-md animate-pulse'></div>
          <div className='w-56 h-8 bg-neutral-700 rounded-md animate-pulse'></div>
        </div>

        {/* Profile section skeleton */}
        <div className='absolute bottom-6 left-10 flex items-center gap-3'>
          <div className='w-12 h-12 rounded-full bg-neutral-700 animate-pulse'></div>
          <div className='flex flex-col gap-2'>
            <div className='w-40 h-6 bg-neutral-700 rounded-md animate-pulse'></div>
            <div className='w-32 h-4 bg-neutral-700 rounded-md animate-pulse'></div>
          </div>
          <div className='flex gap-2 ml-4'>
            <div className='w-8 h-8 rounded-full bg-neutral-700 animate-pulse'></div>
            <div className='w-8 h-8 rounded-full bg-neutral-700 animate-pulse'></div>
          </div>
        </div>
      </div>

      {/* Chart controls skeleton */}
      <div className='bg-neutral-900 p-3 border-b border-neutral-800 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          {['1s', '1m', '5m', '15m', '1h', '4h', 'D'].map((interval, i) => (
            <div
              key={i}
              className='w-8 h-6 bg-neutral-800 rounded-sm animate-pulse'
            ></div>
          ))}
        </div>

        <div className='flex items-center gap-3'>
          <div className='w-24 h-6 bg-neutral-800 rounded-sm animate-pulse'></div>
          <div className='w-40 h-6 bg-neutral-800 rounded-sm animate-pulse'></div>
          <div className='w-48 h-6 bg-neutral-800 rounded-sm animate-pulse'></div>
        </div>

        <div className='flex items-center gap-2'>
          {[1, 2, 3, 4, 5].map((_, i) => (
            <div
              key={i}
              className='w-8 h-6 bg-neutral-800 rounded-sm animate-pulse'
            ></div>
          ))}
        </div>
      </div>

      {/* Chart area skeleton */}
      <div className='bg-neutral-900 h-80 relative'>
        {/* Trading pair info */}
        <div className='absolute top-4 left-4 flex items-center gap-2'>
          <div className='w-32 h-6 bg-neutral-800 rounded-sm animate-pulse'></div>
          <div className='w-4 h-4 rounded-full bg-neutral-700 animate-pulse'></div>
          <div className='w-24 h-6 bg-neutral-800 rounded-sm animate-pulse'></div>
        </div>

        {/* Chart grid lines */}
        <div className='absolute inset-0 flex flex-col justify-between pt-16 pb-8'>
          {[1, 2, 3, 4, 5].map((_, i) => (
            <div key={i} className='w-full h-px bg-neutral-800'></div>
          ))}
        </div>

        {/* Price indicators on right */}
        <div className='absolute top-16 right-4 flex flex-col gap-10'>
          {[1, 2, 3, 4].map((_, i) => (
            <div
              key={i}
              className='w-16 h-4 bg-neutral-800 rounded-sm animate-pulse'
            ></div>
          ))}
        </div>

        {/* Chart tools sidebar */}
        <div className='absolute left-0 top-16 bottom-0 w-12 bg-neutral-900 border-r border-neutral-800 flex flex-col items-center gap-4 py-4'>
          {[1, 2, 3, 4, 5, 6, 7].map((_, i) => (
            <div
              key={i}
              className='w-6 h-6 bg-neutral-800 rounded-sm animate-pulse'
            ></div>
          ))}
        </div>

        {/* Candlestick placeholder */}
        <div className='absolute inset-16 left-16 right-24 flex items-end justify-between'>
          {Array(20)
            .fill(0)
            .map((_, i) => (
              <div key={i} className='flex flex-col items-center gap-1'>
                {/* Static skeleton bar */}
                <div className='w-1.5 h-20 bg-neutral-700 animate-pulse'></div>
                {/* Static skeleton wick */}
                <div className='w-0.5 h-4 bg-neutral-700 animate-pulse'></div>
              </div>
            ))}
        </div>
      </div>

      {/* Bottom controls skeleton */}
      <div className='bg-neutral-900 p-3 border-t border-neutral-800 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          {['5y', '1y', '6m', '3m', '1m', '5d', '1d'].map((interval, i) => (
            <div
              key={i}
              className='w-8 h-6 bg-neutral-800 rounded-sm animate-pulse'
            ></div>
          ))}
        </div>

        <div className='flex items-center gap-2'>
          <div className='w-32 h-6 bg-neutral-800 rounded-sm animate-pulse'></div>
          <div className='w-8 h-6 bg-neutral-800 rounded-sm animate-pulse'></div>
          <div className='w-12 h-6 bg-neutral-800 rounded-sm animate-pulse'></div>
          <div className='w-16 h-6 bg-neutral-800 rounded-sm animate-pulse'></div>
        </div>
      </div>

      {/* Powered by section */}
      <div className='bg-neutral-900 py-2 px-4 flex justify-center items-center border-t border-neutral-800'>
        <div className='w-40 h-5 bg-neutral-800 rounded-sm animate-pulse'></div>
      </div>

      {/* Stats section - NEW */}
      <div className='mt-6 grid grid-cols-1 md:grid-cols-2 gap-4'>
        {/* Left stats box */}
        <div className='bg-neutral-800 rounded-lg p-5'>
          <div className='w-48 h-5 bg-neutral-700 rounded-sm animate-pulse mb-4'></div>
          <div className='w-36 h-8 bg-neutral-700 rounded-sm animate-pulse'></div>
        </div>

        {/* Right stats box */}
        <div className='bg-neutral-800 rounded-lg p-5'>
          <div className='w-40 h-5 bg-neutral-700 rounded-sm animate-pulse mb-4'></div>
          <div className='w-32 h-5 bg-neutral-700 rounded-sm animate-pulse mb-3'></div>
          <div className='w-full h-10 bg-neutral-600 rounded-md animate-pulse mt-4'></div>
        </div>
      </div>

      {/* General Info section - NEW */}
      <div className='mt-4 bg-neutral-800 rounded-lg p-5'>
        <div className='w-32 h-6 bg-neutral-700 rounded-sm animate-pulse mb-4'></div>

        <div className='space-y-4'>
          {[1, 2, 3, 4].map((_, i) => (
            <div key={i} className='flex items-center gap-3'>
              <div className='w-5 h-5 rounded-full bg-neutral-700 animate-pulse'></div>
              <div className='w-3/4 h-5 bg-neutral-700 rounded-sm animate-pulse'></div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation tabs - NEW */}
      <div className='mt-6 flex gap-2'>
        {['About', 'Team', 'Roadmap'].map((tab, i) => (
          <div
            key={i}
            className={`px-4 py-2 rounded-md ${i === 0 ? 'bg-neutral-600' : 'bg-neutral-800'} animate-pulse w-24 h-8`}
          ></div>
        ))}
      </div>

      {/* What Prismo Is section - NEW */}
      <div className='mt-6'>
        <div className='w-64 h-8 bg-neutral-700 rounded-sm animate-pulse mb-4'></div>
        <div className='space-y-3'>
          {[1, 2, 3, 4].map((_, i) => (
            <div
              key={i}
              className='w-full h-5 bg-neutral-700 rounded-sm animate-pulse'
            ></div>
          ))}
        </div>
      </div>

      {/* Why Web3 Needs section - NEW */}
      <div className='mt-8 mb-10'>
        <div className='w-80 h-8 bg-neutral-700 rounded-sm animate-pulse mb-4'></div>
        <div className='space-y-3'>
          {[1, 2, 3, 4, 5].map((_, i) => (
            <div
              key={i}
              className='w-full h-5 bg-neutral-700 rounded-sm animate-pulse'
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
