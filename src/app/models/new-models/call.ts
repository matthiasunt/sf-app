export interface Call {
    startDate: Date;
    endDate: Date;
    userId: string;
    shuttleId: string;
    districtId: string;
    coordinates: Coordinates;
    isHidden: boolean;
}
