export default function ProjectCardLoader() {
  return (
    <div className='bg-neutral-900 rounded-xl overflow-hidden'>
      <div className='h-48 bg-neutral-800 relative animate-pulse'>
        <div className='absolute bottom-4 left-4'>
          <div className='bg-neutral-700 rounded-full p-2 w-10 h-10'></div>
        </div>
      </div>

      <div className='p-6'>
        <div className='h-7 bg-neutral-800 rounded-md w-2/3 mb-4 animate-pulse'></div>

        <div className='space-y-2 mb-6'>
          <div className='h-4 bg-neutral-800 rounded w-full animate-pulse'></div>
          <div className='h-4 bg-neutral-800 rounded w-full animate-pulse'></div>
          <div className='h-4 bg-neutral-800 rounded w-5/6 animate-pulse'></div>
          <div className='h-4 bg-neutral-800 rounded w-4/6 animate-pulse'></div>
        </div>

        <div className='border-t border-neutral-800 pt-4'>
          <div className='flex justify-between items-center mb-3'>
            <div className='h-4 bg-neutral-800 rounded w-1/3 animate-pulse'></div>
            <div className='h-4 bg-neutral-800 rounded w-1/4 animate-pulse'></div>
          </div>

          <div className='flex justify-between items-center'>
            <div className='h-4 bg-neutral-800 rounded w-1/4 animate-pulse'></div>
            <div className='h-4 bg-neutral-800 rounded w-1/6 animate-pulse'></div>
          </div>
        </div>
      </div>
    </div>
  );
}
