export interface Address {
  street: string;
  houseNumber: string;
  postalCode: string;
  locality: {
    de: string;
    it: string;
  };
  region: {
    de: string;
    it: string;
  };
  country: {
    de: string;
    it: string;
  };
}
