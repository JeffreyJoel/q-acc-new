export default function BlogLoader() {
  return (
    <div className='mt-12'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-14'>
        {/* First Article Skeleton */}
        <div className='w-full'>
          <div className='w-full h-[300px] bg-neutral-800 rounded-3xl animate-pulse'></div>
          <div className='w-full mt-6 space-y-3'>
            <div className='h-4 bg-neutral-700 rounded-md w-20 animate-pulse'></div>
            <div className='h-8 bg-neutral-800 rounded-lg w-3/4 animate-pulse'></div>
            <div className='space-y-2'>
              <div className='h-4 bg-neutral-800 rounded w-full animate-pulse'></div>
              <div className='h-4 bg-neutral-800 rounded w-full animate-pulse'></div>
              <div className='h-4 bg-neutral-800 rounded w-2/3 animate-pulse'></div>
            </div>
          </div>
        </div>

        {/* Second Article Skeleton */}
        <div className='w-full'>
          <div className='w-full h-[300px] bg-neutral-800 rounded-3xl animate-pulse'></div>
          <div className='w-full mt-6 space-y-3'>
            <div className='h-4 bg-neutral-700 rounded-md w-20 animate-pulse'></div>
            <div className='h-8 bg-neutral-800 rounded-lg w-3/4 animate-pulse'></div>
            <div className='space-y-2'>
              <div className='h-4 bg-neutral-800 rounded w-full animate-pulse'></div>
              <div className='h-4 bg-neutral-800 rounded w-full animate-pulse'></div>
              <div className='h-4 bg-neutral-800 rounded w-2/3 animate-pulse'></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
