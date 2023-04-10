import { MyCoordinates } from '@models/my-coordinates';

export interface District {
  id: string;
  name: DistrictName;
  region: MultiLangName;
  country: MultiLangName;

  coordinates: MyCoordinates;
}

export interface DistrictName {
  de: string;
  it: string;
  de_st: string;
}

export interface MultiLangName {
  de: string;
  it: string;
}
