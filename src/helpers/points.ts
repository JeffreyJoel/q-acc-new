export function roundPoints(value?: number): string {
  if (value === undefined || value === null) {
    return '0';
  }
  const integerPart = Math.floor(value);
  const decimalPart = value - integerPart;

  return decimalPart < 0.5
    ? integerPart.toLocaleString()
    : Math.ceil(value).toLocaleString();
}
