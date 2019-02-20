export interface Call {
    _id: string;
    startDate: Date;
    endDate: Date;
    userId: string;
    shuttleId: string;
    districtId: string;
    coordinates: Coordinates;
    isHidden: boolean;
}
