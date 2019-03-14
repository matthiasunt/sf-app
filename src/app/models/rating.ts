export interface Rating {
    _id: string;
    type: string;
    userId: string;
    shuttleId: string;
    date: string;

    service: number;
    reliabilityAndPunctuality: number;
    drivingStyleAndSecurity: number;
    price: number;

    review: string;
}
