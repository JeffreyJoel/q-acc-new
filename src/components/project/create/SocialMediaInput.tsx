'use client';

import Image from 'next/image';
import { FC } from 'react';
import { EProjectSocialMediaType } from '@/types/project.type';
import { type RegisterOptions, useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';

interface SocialMediaInputProps {
  name: string;
  label: string;
  iconName: string;
  placeholder?: string;
  rules?: RegisterOptions;
}

export const SocialMediaInput: FC<SocialMediaInputProps> = ({
  name,
  label,
  iconName,
  placeholder,
  rules,
}) => {
  const { register } = useFormContext();
  const fieldName = name === EProjectSocialMediaType.X ? 'twitter' : name.toLowerCase();

  return (
    <div className='flex items-center gap-6 md:gap-12'>
      <div className='w-20 md:w-1/3 flex gap-2 items-center mb-2'>
        <Image
          src={`/images/icons/social/${iconName}`}
          alt={`${label} icon`}
          width={20}
          height={20}
          className="filter invert-[20%]"
        />
        <label className=' text-qacc-gray-light text-sm md:text-lg font-medium'>{label}</label>
      </div>
      <div className='md:w-2/3 relative flex-1'>
        <Input 
          {...register(fieldName, rules)} 
          placeholder={placeholder}
          
          className="border border-neutral-700 rounded-xl focus:ring-peach-400 focus:border-peach-400 outline-none placeholder:text-white/30 text-sm md:text-lg"
        />
      </div>
    </div>
  );
};
