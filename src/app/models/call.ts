import {CouchDoc} from '@models/couch-doc';

export interface Call extends CouchDoc {
    type: string;
    startDate: Date;
    endDate: Date;
    userId: string;
    shuttleId: string;
    origin: CallOrigin;
    isHidden: boolean;
}

export interface CallOrigin {
    name: CallOriginName;
    value: any;
}

export enum CallOriginName {
    History = 'history',
    District = 'district',
    Gps = 'gps',
    Favorite = 'favorite',
    Other = 'other',
}
