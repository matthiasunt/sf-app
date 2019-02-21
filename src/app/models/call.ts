export interface Call {
    _id: string;
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
    value: string;
}

export enum CallOriginName {
    History = 'history',
    District = 'district',
    Gps = 'gps',
}
