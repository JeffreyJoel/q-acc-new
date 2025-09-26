import { formatNumber } from './donations';

export * from './getPaymentAddresses';

export const capitalizeFirstLetter = (str: string) => {
  return str
    .toLowerCase()
    .replace(/(?:^|\.\s*)([a-z])/g, match => match.toUpperCase());
};

export const formatNumberCompact = (
  value: number | null | undefined,
  isCurrency = false
) => {
  if (value === null || value === undefined) return '-';
  let num = value;
  let suffix = '';

  if (Math.abs(num) >= 1_000_000) {
    num = num / 1_000_000;
    suffix = 'M';
  } else if (Math.abs(num) >= 1_000) {
    num = num / 1_000;
    suffix = 'K';
  }

  const formatted = num.toFixed(num >= 100 ? 0 : 1);
  return `${isCurrency ? '$' : ''}${formatted}${suffix}${isCurrency ? '' : ' POL'}`;
};

export const formatPercentageChange = (change: number) => {
  const isPositive = change > 0;
  const isZero = change == 0;
  const color =
    isPositive && !isZero
      ? 'text-[#6DC28F]'
      : isZero
        ? 'text-qacc-gray-light/60'
        : 'text-red-400';
  const sign = isPositive ? '↑' : isZero ? '' : '↓';

  return {
    color,
    sign,
    formatted: `${sign}${formatNumber(change)}%`,
  };
};

export const extractVideoId = (url: string) => {
  if (!url) return '';
  const match = url.match(/(?:v=|\/shorts\/)([^?&\/]+)/);
  return match && match[1] ? match[1] : '';
};
