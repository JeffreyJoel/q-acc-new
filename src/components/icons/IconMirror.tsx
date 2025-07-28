import { FC } from 'react';
export const IconMirror: FC<{
  size?: number;
  color?: string;
}> = ({
  size = 24,
  color = 'currentColor',
}) => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 10.1935C6 6.77295 8.68629 4 12 4C15.3137 4 18 6.77295 18 10.1935V19.0589C18 19.5786 17.5918 20 17.0882 20H6.91177C6.40822 20 6 19.5786 6 19.0589V10.1935Z" fill="#91A0A1" fillOpacity="0.4"/>
    </svg>
    
  );
};
