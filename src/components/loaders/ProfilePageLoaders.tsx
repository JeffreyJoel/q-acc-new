// Loading skeleton component for tab content
export const TabContentSkeleton = () => (
  <div className='space-y-6'>
    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
      <div className='h-24 bg-neutral-800 rounded-lg animate-pulse'></div>
      <div className='h-24 bg-neutral-800 rounded-lg animate-pulse'></div>
      <div className='h-24 bg-neutral-800 rounded-lg animate-pulse'></div>
    </div>
    <div className='space-y-4'>
      <div className='h-32 bg-neutral-800 rounded-lg animate-pulse'></div>
      <div className='h-32 bg-neutral-800 rounded-lg animate-pulse'></div>
      <div className='h-32 bg-neutral-800 rounded-lg animate-pulse'></div>
    </div>
  </div>
);

// Loading skeleton for projects/tokens content
export const ProjectsTokensSkeleton = () => (
  <div className='space-y-4'>
    {[...Array(3)].map((_, i) => (
      <div key={i} className='p-6 bg-neutral-800 rounded-xl'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-4'>
            <div className='w-16 h-16 bg-neutral-700 rounded-lg animate-pulse'></div>
            <div className='space-y-2'>
              <div className='h-5 bg-neutral-700 rounded w-32 animate-pulse'></div>
              <div className='h-4 bg-neutral-700 rounded w-24 animate-pulse'></div>
            </div>
          </div>
          <div className='space-y-2'>
            <div className='h-4 bg-neutral-700 rounded w-20 animate-pulse'></div>
            <div className='h-4 bg-neutral-700 rounded w-16 animate-pulse'></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Loading skeleton for verifications
export const VerificationsSkeleton = () => (
  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
    {[...Array(4)].map((_, i) => (
      <div
        key={i}
        className='p-6 bg-neutral-800 rounded-xl border border-neutral-700'
      >
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            <div className='w-8 h-8 bg-neutral-700 rounded-full animate-pulse'></div>
            <div className='space-y-2'>
              <div className='h-4 bg-neutral-700 rounded w-24 animate-pulse'></div>
              <div className='h-3 bg-neutral-700 rounded w-16 animate-pulse'></div>
            </div>
          </div>
          <div className='h-8 bg-neutral-700 rounded w-20 animate-pulse'></div>
        </div>
      </div>
    ))}
  </div>
);
