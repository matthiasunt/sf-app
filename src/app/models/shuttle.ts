export interface Shuttle {
  _id: string;
  type: string;
  name: string;
  phone: string;
  districts: string[];
  city: {
    de: string,
    it: string
  };
  location: {
    latitude: string,
    longitude: string
  };

}
