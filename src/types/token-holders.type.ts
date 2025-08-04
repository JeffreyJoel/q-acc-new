export interface ITokenHolder {
  owner_address: string;
  percentage_relative_to_total_supply: number;
  label?: string;
}

export interface ITokenHolders {
  holders: ITokenHolder[];
}
