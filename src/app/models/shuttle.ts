export interface Shuttle {
  _id: string;
  name: string;
  phone: string;
  districts: string[];
  first_name: string;
  last_name: string;
  street: string;
  zip: string;
  city: {
    de: string,
    it: string
  };
  location: {
    latitude: string,
    longitude: string
  };
  website: string;
  facebook: string;
  description: string;

}
