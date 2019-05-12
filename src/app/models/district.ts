import {Coordinates} from '@models/coordinates';

export interface District {
    _id: string;
    type: string;
    name: DistrictName;
    region: MultiLangName;
    country: MultiLangName;

    coordinates: Coordinates;
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
