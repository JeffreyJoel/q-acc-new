export interface ITokenHolder {
  address: string;
  percentage: number;
  label?: string;
}

export interface ITokenHoldersResponse {
  success: boolean;
  totalHolders: number;
  holders: ITokenHolder[];
}
