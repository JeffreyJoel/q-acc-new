export * from './getPaymentAddresses'; 

export const capitalizeFirstLetter = (str: string) => {
    return str
      .toLowerCase()
      .replace(/(?:^|\.\s*)([a-z])/g, (match) => match.toUpperCase());
  };