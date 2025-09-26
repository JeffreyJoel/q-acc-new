import { FC } from 'react';

export const IconX: FC<{
  size?: number;
  color?: string;
  fillOpacity?: number;
}> = ({ size = 24, color = '#91A0A1', fillOpacity = 1 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M19.4314 4L13.8579 10.8264L20.5 20H15.0843L10.9873 14.344L6.36895 20H3.88048L9.81914 12.728L3.5 4H8.91571L12.6897 9.2136L16.9438 4H19.4314Z'
        fill={color}
        fillOpacity={fillOpacity}
      />
    </svg>
  );
};
