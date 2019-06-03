import {MyCoordinates} from '@models/my-coordinates';
import {CouchDoc} from '@models/couch-doc';

export interface District  extends CouchDoc {
    type: string;
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
