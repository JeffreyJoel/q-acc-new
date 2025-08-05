export * from './getPaymentAddresses'; 

export const capitalizeFirstLetter = (str: string) => {
    return str
      .toLowerCase()
      .replace(/(?:^|\.\s*)([a-z])/g, (match) => match.toUpperCase());
  };

   export const formatNumber = (value: number | null | undefined, isCurrency = false) => {
    if (value === null || value === undefined) return "-";
    let num = value;
    let suffix = "";

    if (Math.abs(num) >= 1_000_000) {
      num = num / 1_000_000;
      suffix = "M";
    } else if (Math.abs(num) >= 1_000) {
      num = num / 1_000;
      suffix = "K";
    }

    const formatted = num.toFixed(num >= 100 ? 0 : 1);
    return `${isCurrency ? "$" : ""}${formatted}${suffix}${isCurrency ? "" : " POL"}`;
  };