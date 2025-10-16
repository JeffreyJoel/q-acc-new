import React from 'react';
import { TERMS_AND_CONDITIONS_HTML } from '@/helpers/TOS';

const TOS = () => {
  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-10'>
      <div
        className='text-justify'
        dangerouslySetInnerHTML={{ __html: TERMS_AND_CONDITIONS_HTML }}
      />
    </div>
  );
};

export default TOS;
