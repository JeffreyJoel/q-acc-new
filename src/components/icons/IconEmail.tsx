import { FC } from "react";

export const IconEmail: FC<{
  size?: number;
  color?: string;
}> = ({ size = 24, color = "currentColor" }) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill-rule="evenodd"
        clipRule="evenodd"
        d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18L2.01 6C2.01 4.9 2.9 4 4 4ZM11.4707 12.533C11.7731 12.7998 12.2269 12.7998 12.5293 12.533L18.4863 7.27677C18.6719 7.11299 18.4532 6.82441 18.2453 6.95889L12.4346 10.7188C12.1701 10.8899 11.8299 10.8899 11.5654 10.7188L5.75465 6.95889C5.54682 6.82441 5.32806 7.11299 5.51368 7.27677L11.4707 12.533Z"
        fill="#91A0A1"
        fill-opacity="0.4"
      />
    </svg>
  );
};
